import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokens.js';
import { LoginInput, UpdateProfileInput } from '../schemas/auth.schema.js';

const SALT_ROUNDS = 12;
const INVALID_CREDENTIALS = 'Credenciais inválidas';
const ACCOUNT_NOT_ACTIVE = 'Conta inativa ou suspensa. Entre em contato com o suporte.';

/**
 * Hash descartável de um valor aleatório, usado para gastar o mesmo tempo de
 * bcrypt quando o e-mail não existe. Sem isso o tempo de resposta revela quais
 * contas estão cadastradas. Nada consegue casar com ele.
 */
const TIMING_EQUALIZER_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);

export class AuthService {
  /**
   * Autentica o usuário, atualiza lastLoginAt e emite o par de tokens.
   *
   * A senha é verificada ANTES do status da conta, e todo fracasso de
   * credencial devolve a mesma mensagem: um atacante sem senha válida não
   * consegue distinguir "e-mail inexistente" de "e-mail existente".
   */
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: true,
        companyAccess: true,
      },
    });

    if (!user) {
      await bcrypt.compare(data.password, TIMING_EQUALIZER_HASH);
      throw new Error(INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error(INVALID_CREDENTIALS);
    }

    // Só depois da senha correta é seguro detalhar o motivo do bloqueio.
    if (user.status !== 'ACTIVE') {
      throw new Error(ACCOUNT_NOT_ACTIVE);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    // Gera Refresh Token bruto para o cliente e armazena apenas o hash SHA-256
    const { token: rawRefreshToken, expiresAt } = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);

    await prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.fullName || 'Usuário CopperOS',
        role: user.role,
        status: user.status,
        profile: user.profile,
        companyAccess: user.companyAccess.map((c) => c.companyId),
      },
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  /**
   * Rotação de Refresh Token com Detecção de Reutilização Maliciosa (Token Replay Attack)
   */
  async refreshToken(rawToken: string) {
    const tokenHash = hashToken(rawToken);

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!savedToken || savedToken.revoked || new Date() > savedToken.expiresAt) {
      if (savedToken && savedToken.revoked) {
        await prisma.refreshToken.updateMany({
          where: { userId: savedToken.userId },
          data: { revoked: true },
        });
      }
      throw new Error('Refresh token inválido ou expirado');
    }

    // O status é reavaliado a cada renovação: desativar a conta encerra a
    // sessão de imediato, em vez de valer só quando o refresh token expirar.
    if (savedToken.user.status !== 'ACTIVE') {
      await prisma.refreshToken.updateMany({
        where: { userId: savedToken.userId },
        data: { revoked: true },
      });
      throw new Error(ACCOUNT_NOT_ACTIVE);
    }

    // Invalida o token atual (Rotação atômica)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revoked: true },
    });

    const newAccessToken = generateAccessToken({
      sub: savedToken.user.id,
      email: savedToken.user.email,
    });

    const { token: newRawRefreshToken, expiresAt } = generateRefreshToken();
    const newTokenHash = hashToken(newRawRefreshToken);

    await prisma.refreshToken.create({
      data: {
        token: newTokenHash,
        userId: savedToken.user.id,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  /**
   * Invalida a sessão do usuário (Logout)
   */
  async logout(rawToken: string) {
    if (!rawToken) return;

    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { token: tokenHash },
      data: { revoked: true },
    });
  }

  /**
   * Limpeza periódica de tokens expirados
   */
  async cleanupExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true },
        ],
      },
    });
  }

  /**
   * Obtém os dados completos do usuário e perfil
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        companyAccess: {
          select: {
            companyId: true,
            roleInCompany: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Atualiza os dados do perfil do usuário.
   *
   * Os campos são montados um a um, em vez de espalhar o corpo da requisição:
   * assim nenhuma coluna fora desta lista (userId, document, ...) é gravável
   * pelo cliente, mesmo que passe pela validação.
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const editable = {
      fullName: data.fullName,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      phone: data.phone,
      jobTitle: data.jobTitle,
      department: data.department,
      bio: data.bio,
      themePreference: data.themePreference,
    };

    const changes = Object.fromEntries(
      Object.entries(editable).filter(([, value]) => value !== undefined)
    );

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        ...changes,
        userId,
        fullName: data.fullName || 'Usuário CopperOS',
      },
      update: changes,
    });

    return profile;
  }
}

export const authService = new AuthService();

import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokens.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

export class AuthService {
  /**
   * Registra um novo usuário com senha em hash bcrypt (salt factor 12)
   */
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('E-mail já está cadastrado');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Autentica usuário e emite par de tokens (Access + Refresh).
   * O Refresh Token é salvo no banco como HASH SHA-256.
   */
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gera Access Token (JWT curto)
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    // Gera Refresh Token bruto para o cliente e armazena apenas o hash no PostgreSQL
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
        name: user.name,
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

    // Se o token não existe, está revogado ou expirou
    if (!savedToken || savedToken.revoked || new Date() > savedToken.expiresAt) {
      // Se estava revogado mas foi reenviado (possível ataque de replay/roubo de token)
      // Revoga TODAS as sessões do usuário imediatamente como medida de segurança proativa
      if (savedToken && savedToken.revoked) {
        await prisma.refreshToken.updateMany({
          where: { userId: savedToken.userId },
          data: { revoked: true },
        });
      }
      throw new Error('Refresh token inválido ou expirado');
    }

    // Invalida o token atual (Rotação atômica)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revoked: true },
    });

    // Gera novo par de tokens
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
   * Limpeza de tokens expirados no banco de dados (previne inchaço de tabela)
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
   * Obtém os dados do perfil do usuário autenticado
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}

export const authService = new AuthService();

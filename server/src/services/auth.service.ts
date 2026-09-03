import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokens.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

export class AuthService {
  /**
   * Registra um novo usuário criando o User e o Profile associado atomicamente
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
        passwordHash,
        role: 'ADMIN', // Primeiro usuário ou padrão configurável
        status: 'ACTIVE',
        profile: {
          create: {
            fullName: data.name || 'Usuário CopperOS',
            displayName: data.name?.split(' ')[0] || 'Usuário',
            timezone: 'America/Sao_Paulo',
            locale: 'pt-BR',
            themePreference: 'dark',
          },
        },
        companyAccess: {
          create: {
            companyId: 'emp-copper-group', // Acesso padrão à holding
            roleInCompany: 'ADMIN',
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatarUrl: true,
            jobTitle: true,
            department: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * Autentica usuário, atualiza lastLoginAt e emite par de tokens
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
      throw new Error('Credenciais inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Conta inativa ou suspensa. Entre em contato com o suporte.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Atualiza data do último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Gera Access Token (JWT curto)
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    // Gera Refresh Token bruto para o cliente e armazena apenas o hash SHA-256 no PostgreSQL
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
   * Atualiza os dados do perfil do usuário
   */
  async updateProfile(userId: string, data: {
    fullName?: string;
    displayName?: string;
    avatarUrl?: string;
    phone?: string;
    jobTitle?: string;
    department?: string;
    bio?: string;
    themePreference?: string;
  }) {
    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: data.fullName || 'Usuário CopperOS',
        ...data,
      },
      update: {
        ...data,
      },
    });

    return profile;
  }
}

export const authService = new AuthService();

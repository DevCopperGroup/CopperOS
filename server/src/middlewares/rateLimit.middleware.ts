import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter rigoroso para rotas de autenticação (Login e Register)
 * Limita a 10 tentativas a cada 15 minutos por IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limite de 10 requisições
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  message: {
    message: 'Muitas tentativas de autenticação a partir deste IP. Tente novamente em 15 minutos.',
    retryAfterMinutes: 15,
  },
});

/**
 * Rate Limiter para rotas gerais da API
 * Limita a 100 requisições por 15 minutos por IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Limite de requisições excedido. Tente novamente mais tarde.',
  },
});

/**
 * Rate Limiter para a rotação de refresh token.
 *
 * Mais folgado que o de login de propósito: o refresh token tem 40 bytes
 * aleatórios (força bruta é inviável), e cada recarga de página consome uma
 * renovação — um limite estrito derrubaria uso legítimo.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Muitas renovações de sessão a partir deste IP. Tente novamente em alguns minutos.',
  },
});

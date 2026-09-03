# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências e gera o Prisma Client
RUN npm install
RUN npx prisma generate

# Copia o código fonte e compila TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ── Stage 2: Production Runner ──────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Instala apenas dependências de produção
RUN npm install --omit=dev
RUN npx prisma generate

# Copia a build gerada do stage anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3333

# Script de inicialização: roda migrações do banco e inicia a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

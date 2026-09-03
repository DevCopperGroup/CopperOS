# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Nginx Web Server ────────────────────────────────
FROM nginx:alpine

# Copia a build do React para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração de proxy reverso
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

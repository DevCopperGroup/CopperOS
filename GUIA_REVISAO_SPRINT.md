# 📋 Guia de Entrega e Revisão da Sprint

## Tarefa: "Desenvolver API de autenticação (Login, Logout e Tokens)"

Este documento contém o passo a passo completo para submeter o código para Code Review (Pull Request), instruções para os revisores testarem na máquina deles e roteiro de apresentação na Sprint Review.

---

## 🚀 1. Passo a Passo do Git (Como subir para o repositório)

Execute os comandos abaixo no terminal na raiz do projeto (`copperos`):

```powershell
# 1. Cria a branch da funcionalidade
git checkout -b feature/auth-api-login-logout-tokens

# 2. Adiciona todos os arquivos do backend e frontend
git add .

# 3. Faz o commit com mensagem padronizada
git commit -m "feat(auth): implement authentication api with login, logout, jwt and refresh tokens"

# 4. Envia a branch para o GitHub / GitLab
git push -u origin feature/auth-api-login-logout-tokens
```

---

## 📝 2. Template Pronto para o Pull Request (PR)

Ao criar o Pull Request no GitHub, copie e cole a descrição abaixo:

```markdown
## 🎯 Objetivo da Tarefa
Implementação completa da API de autenticação corporativa com Login, Logout, rotação de Refresh Tokens e Access Tokens (JWT) utilizando **Node.js + TypeScript + PostgreSQL (Prisma ORM)**, integrada à tela de login do frontend.

---

## 📦 O que foi desenvolvido:

### Endpoints da API REST (`/api/auth/`):
- `POST /register`: Criação de conta com hash Bcrypt (salt factor 12) e validação de schema com Zod.
- `POST /login`: Validação de credenciais, geração de `accessToken` (JWT 15m) e atribuição de `refreshToken` (7 dias) em cookie seguro `HttpOnly`.
- `POST /refresh`: Rotação atômica de refresh tokens com detecção de Token Replay Attack.
- `POST /logout`: Invalidação da sessão ativa no PostgreSQL e remoção do cookie no cliente.
- `GET /me`: Rota protegida com middleware JWT que retorna os dados do usuário logado.

### 🛡️ Camadas de Segurança e Hardening:
- **Rate Limiting**: Bloqueio de ataques de força bruta com `express-rate-limit` (máximo de 10 tentativas a cada 15 min nas rotas críticas).
- **Hash de Tokens no PostgreSQL**: Armazenamento do hash SHA-256 dos Refresh Tokens para proteção contra vazamento de banco de dados.
- **HTTP Security Headers**: Proteção contra MIME Sniffing, Clickjacking e DoS com `Helmet`.
- **Mitigação de Injeção**: Validação com Zod e parametrização estrita de queries via Prisma ORM.
- **Auditoria**: `npm audit` zerado (0 vulnerabilidades).

---

## 🧪 Como Testar Localmente:

### 1. Iniciar o Backend:
\`\`\`bash
cd server
npm install
npx prisma migrate dev
npm run dev
\`\`\`
*(A API iniciará em `http://localhost:3333`)*

### 2. Iniciar o Frontend:
\`\`\`bash
# Na raiz do projeto
npm install
npm run dev
\`\`\`
*(O frontend iniciará em `http://localhost:5173`)*

### 3. Teste do Fluxo de Usuário:
1. Acesse `http://localhost:5173` no navegador.
2. Na aba **"Criar Conta"**, registre um novo e-mail corporativo e senha.
3. Observe o redirecionamento automático para o **Hub** do CopperOS com a sessão autenticada.
4. Para inspecionar os dados salvos no banco, execute `npx prisma studio` dentro da pasta `server`.
```

---

## 🎤 3. Roteiro de Demonstração na Sprint Review

Se você for apresentar o trabalho para o time ou stakeholders:

1. **Apresentar a Arquitetura**:
   - Destaque que a solução utiliza **Access Token JWT em memória** + **Refresh Token seguro em cookie HttpOnly** com rotação atômica.
2. **Demonstrar no Navegador**:
   - Abra a tela em `http://localhost:5173`.
   - Crie um usuário na aba **"Criar Conta"**.
   - Mostre a transição suave e o acesso liberado ao **Hub corporativo**.
3. **Demonstrar a Segurança no Banco de Dados**:
   - Abra o terminal e rode `npx prisma studio`.
   - Mostre que a senha do usuário está criptografada com **Bcrypt** e o refresh token está protegido com **Hash SHA-256**.
4. **Demonstrar a Proteção contra Força Bruta**:
   - Destaque que o backend possui rate limiting que bloqueia ataques automatizados mesmo fora do navegador.

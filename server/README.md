# 🛡️ API de Autenticação (Node.js + TypeScript + PostgreSQL + Prisma)

API completa e segura para autenticação de usuários, utilizando **JWT (Access Token)** e **Refresh Tokens** com rotação, persistência no **PostgreSQL** e armazenamento seguro via cookies `HttpOnly`.

---

## 📦 Tecnologias Utilizadas

- **Node.js** & **TypeScript**
- **Express** (Framework Web)
- **PostgreSQL** & **Prisma ORM**
- **Bcrypt.js** (Hash de senhas com 12 salt rounds)
- **JSONWebToken (JWT)** (Tokens de curta duração)
- **Zod** (Validação estrita de schemas)
- **Cookie-Parser** & **CORS** (Com suporte a cookies seguros)

---

## 🚀 Como Executar o Projeto

### 1. Instalar Dependências

Navegue até a pasta `server`:
```bash
cd server
npm install
```

### 2. Configurar o Banco de Dados

Edite o arquivo `.env` com os dados de conexão do seu PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco?schema=public"
```

### 3. Rodar as Migrações do Prisma

Gera as tabelas `users` e `refresh_tokens` no PostgreSQL:
```bash
npx prisma migrate dev --name init
```

*(Opcional) Para visualizar o banco de dados graficamente no navegador:*
```bash
npx prisma studio
```

### 4. Iniciar o Servidor

Modo de desenvolvimento (com hot reload via `tsx`):
```bash
npm run dev
```
O servidor estará rodando em: `http://localhost:3333`

---

## 📡 Guia dos Endpoints

### 1. Provisionamento de Contas

**Não existe auto-cadastro.** A API não expõe `POST /api/auth/register`: contas são
criadas exclusivamente pelo Time de TI em `POST /api/users`, que exige um chamador
autenticado com papel `SUPERADMIN` ou `ADMIN` (ver *Autorização (RBAC)* abaixo).

A primeira conta administrativa deve ser semeada diretamente no banco, com um hash
bcrypt gerado fora da aplicação — assim nenhum caminho público consegue criar um
usuário privilegiado.

---

### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
```json
{
  "email": "maria@exemplo.com",
  "password": "senhaSegura123"
}
```
- **Resposta (200 OK)**:
  - Define o cookie `refreshToken` (`HttpOnly`, `SameSite=Strict`, `Path=/`).
  - Retorna o `accessToken`:
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "c1f7a2d4-...",
    "email": "maria@exemplo.com",
    "name": "Maria Silva"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

---

### 3. Rotação de Token (Refresh)
- **Endpoint**: `POST /api/auth/refresh`
- **Headers/Cookies**: O navegador enviará o cookie `refreshToken` automaticamente.
- **Resposta (200 OK)**:
  - Atualiza o cookie com o **novo** `refreshToken`.
  - Retorna o **novo** `accessToken`:
```json
{
  "message": "Token renovado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

---

### 4. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Ação**: Invalida o Refresh Token no banco de dados e apaga o cookie no navegador.
- **Resposta (200 OK)**:
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### 5. Perfil do Usuário Autenticado (Rota Protegida)
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <SEU_ACCESS_TOKEN>`
- **Resposta (200 OK)**:
```json
{
  "user": {
    "id": "c1f7a2d4-...",
    "email": "maria@exemplo.com",
    "name": "Maria Silva",
    "createdAt": "2026-09-03T11:00:00.000Z",
    "updatedAt": "2026-09-03T11:00:00.000Z"
  }
}
```

---

## 🔐 Autorização (RBAC)

Hierarquia de papéis, do mais alto para o mais baixo:

`SUPERADMIN` > `ADMIN` > `MANAGER` > `OPERATOR` > `VIEWER`

Todas as rotas de `/api/users` (o Painel de TI) exigem `authenticate` **e**
`requireRole('SUPERADMIN', 'ADMIN')`. Regras aplicadas em cada operação:

| Regra | Motivo |
|-------|--------|
| O papel é lido do banco a cada requisição, nunca do JWT | Revogar acesso ou rebaixar alguém vale na hora, sem esperar o access token expirar |
| Contas com status diferente de `ACTIVE` são rejeitadas | Suspensão tem efeito imediato |
| Ninguém altera o próprio papel ou status pelo painel | Impede auto-promoção e auto-bloqueio |
| O chamador precisa de patente **estritamente superior** à do alvo | Um `ADMIN` não mexe em outro `ADMIN` nem em um `SUPERADMIN` |
| O chamador não concede papel acima do próprio | Impede escalada por procuração |
| Trocar papel/status ou resetar senha revoga as sessões do alvo | Nenhum token antigo sobrevive à mudança de privilégio |

Toda ação privilegiada emite uma linha `[AUDIT]` com autor, ação e alvo.

---

## 💻 Exemplo de Consumo no Frontend (React / Fetch)

```ts
// 1. Login
const res = await fetch('http://localhost:3333/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // IMPORTANTE para enviar e receber cookies HttpOnly
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
const accessToken = data.accessToken; // Salvar em memória (React state/Zustand)

// 2. Requisição Protegida
const profileRes = await fetch('http://localhost:3333/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  credentials: 'include',
});

// 3. Renovar Token quando expirar (Status 401)
const refreshRes = await fetch('http://localhost:3333/api/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});
const refreshData = await refreshRes.json();
const newAccessToken = refreshData.accessToken;
```

# 🚀 Guia de Deploy em VPS Hostinger (Docker & PostgreSQL)

Este guia explica como hospedar o **CopperOS completo (Frontend + Backend + PostgreSQL)** em uma VPS da **Hostinger** com **1 único comando**, garantindo alta performance, isolamento e persistência dos dados.

---

## 🎯 Por que a sua ideia de usar VPS está 100% CORRETA?

1. **Custo Fixo e Baixo**: Uma VPS da Hostinger custa a partir de ~R$ 30 a R$ 45/mês e roda tudo (banco, backend, frontend) sem cobranças surpresa por tráfego.
2. **Autonomia Total**: Você não depende de serviços externos e tem controle total do servidor.
3. **Isolamento com Docker**: O PostgreSQL roda em contêiner com volume seguro, e o backend sobe automaticamente as migrações do Prisma a cada atualização.

---

## 📋 Arquitetura no Servidor da Hostinger

```
                  ┌──────────────────────────────────────────────┐
                  │            VPS HOSTINGER (Ubuntu)            │
                  │                                              │
Internet (Porta 80) ──> [ NGINX / Frontend (React) ]            │
                  │             │                                │
                  │      (Proxy /api/)                           │
                  │             ▼                                │
                  │       [ Backend (Node.js/Express) ]          │
                  │             │                                │
                  │       (Prisma ORM)                           │
                  │             ▼                                │
                  │       [ PostgreSQL Database ]                │
                  │             │                                │
                  │       [ Volume: postgres_data ] (Persistente)│
                  └──────────────────────────────────────────────┘
```

---

## 🛠️ Passo a Passo para Quando Você Contratar a VPS

### Passo 1: Contratar a VPS na Hostinger
1. Escolha o plano **KVM 1** ou **KVM 2** (recomendado 2GB a 4GB de RAM).
2. Na escolha do Sistema Operacional, selecione: **Ubuntu 22.04 (com Docker)** ou **Ubuntu 24.04**.

---

### Passo 2: Conectar na VPS via SSH
No seu terminal (Windows PowerShell ou Mac/Linux), conecte-se usando o IP fornecido pela Hostinger:

```powershell
ssh root@SEU_IP_DA_HOSTINGER
```
*(Digite a senha que você cadastrou no painel da Hostinger)*

---

### Passo 3: Clonar o Repositório do Projeto

No terminal da VPS, execute:

```bash
# 1. Instala o git se necessário
apt update && apt install -y git

# 2. Clona o seu repositório
git clone https://github.com/DevCopperGroup/CopperOS.git

# 3. Entra na pasta do projeto
cd CopperOS

# 4. Muda para a branch com todo o backend configurado
git checkout feature/auth-api-login-logout-tokens
```

---

### Passo 4: Configurar as Variáveis de Produção (Opcional)

Se desejar alterar as senhas de produção:
```bash
cp .env.production.example .env
nano .env
```
*(Altere as senhas se quiser e salve com `Ctrl + O` e saia com `Ctrl + X`)*

---

### Passo 5: Subir Toda a Aplicação com 1 Comando

Execute:

```bash
docker compose up -d --build
```

O Docker fará tudo de forma 100% automática:
1. ✅ Baixa e inicia o **PostgreSQL**.
2. ✅ Compila o **Backend Node.js**, executa as **migrations do Prisma** e inicia a API.
3. ✅ Compila o **Frontend Vite** e inicia o **Nginx**.

---

### 🌐 Testar no Navegador

Abra o seu navegador e acesse diretamente pelo IP da sua VPS:
```
http://SEU_IP_DA_HOSTINGER
```
A aplicação estará rodando completa e conectada ao banco PostgreSQL!

---

## 🔒 Quando você comprar um Domínio (Adicionar HTTPS / SSL Grátis)

Quando você tiver um domínio (ex: `app.coppergroup.com.br`):
1. Aponte o registro **A** do domínio no DNS para o **IP da Hostinger**.
2. Na VPS, instale o **Certbot (Let's Encrypt)** para ter certificado SSL gratuito com 1 comando:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seu-dominio.com.br
```
Seu site passará a abrir em **`https://seu-dominio.com.br`** com cadeado verde de segurança!

---

## 🔄 Como Atualizar o Sistema no Futuro (Deploy Contínuo)

Sempre que você fizer novos commits no Git, para atualizar a VPS bastam 2 comandos:

```bash
git pull
docker compose up -d --build
```
*(O banco de dados não perde nenhum dado porque fica salvo no volume persistente `postgres_data`)*.

# 🌐 CloudFarm: Configuração Cloud vs Local

## 🎯 PROBLEMA IDENTIFICADO

✅ **Backend CloudFarm:** Rodando em `localhost:3001` (PM2)  
❌ **Frontend:** Rodando em `fly.dev` (cloud)  
📍 **Problema:** Cloud não consegue acessar localhost

## 🚀 SOLUÇÃO RECOMENDADA: Desenvolvimento Local

### 1️⃣ Baixar e Rodar Localmente

```bash
# 1. Baixar o projeto (se ainda não tiver)
git clone [URL_DO_SEU_REPOSITORIO]
cd cloudfarm-web

# 2. Instalar dependências
npm install

# 3. Verificar se backend está rodando
curl http://localhost:3001/api/health

# 4. Rodar frontend localmente
npm start
```

### 2️⃣ Configuração Local

Seu arquivo `.env` já está correto:
```env
REACT_APP_CLOUDFARM_API_URL=http://localhost:3001/api
```

### 3️⃣ Verificar Conectividade

Com ambos rodando localmente:
- **Backend:** `http://localhost:3001` (PM2)
- **Frontend:** `http://localhost:3000` (npm start)

## 🌍 ALTERNATIVA: Backend Público

Se quiser manter o frontend no fly.dev, precisa expor o backend:

### Opção A: Ngrok (Túnel temporário)
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3001
ngrok http 3001

# Usar URL do ngrok no .env:
# REACT_APP_CLOUDFARM_API_URL=https://abc123.ngrok.io/api
```

### Opção B: Deploy Backend na Nuvem
- Deploy do backend no Heroku, Railway, ou Fly.io
- Atualizar URL no .env

## 🎯 RECOMENDAÇÃO

**Para desenvolvimento:** Use setup local (mais rápido e confiável)
**Para produção:** Deploy ambos na nuvem

## 📋 CHECKLIST ATUAL

- ✅ Backend rodando (PM2 - localhost:3001)
- ✅ Frontend compilando (fly.dev)
- ❌ Conectividade (cloud ↔ localhost)

**Próximo passo:** Rodar frontend localmente com `npm start`

---

💡 **Dica:** O desenvolvimento local é sempre mais eficiente para testar mudanças rapidamente!

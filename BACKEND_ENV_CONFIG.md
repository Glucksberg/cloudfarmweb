# Backend .env Configuration Guide

## ❌ ERRO COMUM: REACT_APP_ no Backend

**NUNCA coloque variáveis `REACT_APP_` no backend .env!**

❌ **ERRADO (no backend):**
```bash
REACT_APP_CLOUDFARM_API_URL=http://localhost:3001/api
```

## ✅ Configuração Correta

### Frontend .env (React)
```bash
# Variáveis do FRONTEND (prefixo REACT_APP_)
REACT_APP_CLOUDFARM_API_URL=http://178.156.157.146:3001/api
REACT_APP_CLOUDFARM_WS_URL=ws://178.156.157.146:3001/ws
REACT_APP_MAPBOX_TOKEN=sua_chave_mapbox
```

### Backend .env (Node.js/Express)
```bash
# Configurações do SERVIDOR BACKEND
PORT=3001
NODE_ENV=production

# CORS - Frontend URL permitida
CORS_ORIGIN=https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev

# Database (se usar)
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...

# JWT (se usar autenticação)
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h

# CloudFarm específicos
CLOUDFARM_API_KEY=sua_chave_api
CLOUDFARM_DATABASE_HOST=localhost
CLOUDFARM_DATABASE_PORT=5432
CLOUDFARM_DATABASE_NAME=cloudfarm
CLOUDFARM_DATABASE_USER=cloudfarm_user
CLOUDFARM_DATABASE_PASSWORD=sua_senha

# Logs
LOG_LEVEL=info
```

## 🔧 Como Verificar no VPS

### 1. Verificar Backend .env
```bash
# No VPS, ir para o diretório do backend
cd ~/CloudFarm
cat .env

# Deve mostrar apenas variáveis do servidor, SEM REACT_APP_
```

### 2. Verificar se Backend está Rodando
```bash
# Verificar processos
pm2 list

# Verificar porta
netstat -tlnp | grep 3001

# Verificar logs
pm2 logs cloudfarm-api
```

### 3. Testar Backend Diretamente
```bash
# Testar endpoint básico
curl -i http://localhost:3001/
curl -i http://localhost:3001/api/health

# Testar de fora (substituir SEU_IP)
curl -i http://178.156.157.146:3001/
curl -i http://178.156.157.146:3001/api/health
```

## 🚨 Problemas Comuns

### 1. CORS não configurado
**Sintoma:** Frontend consegue conectar mas recebe erro CORS  
**Solução:** Verificar `src/index.js` no backend tem:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### 2. Backend não escuta IP externo
**Sintoma:** `curl localhost:3001` funciona mas `curl IP_EXTERNO:3001` falha  
**Solução:** Backend deve escutar `0.0.0.0:3001`, não `127.0.0.1:3001`

### 3. Firewall bloqueando porta
**Sintoma:** Timeout ao conectar externamente  
**Solução:**
```bash
sudo ufw allow 3001
sudo ufw status
```

### 4. PM2 não está rodando o processo
**Sintoma:** `pm2 list` não mostra o processo  
**Solução:**
```bash
cd ~/CloudFarm
pm2 start src/index.js --name cloudfarm-api
pm2 save
```

## 📋 Checklist de Verificação

- [ ] Backend .env NÃO tem variáveis `REACT_APP_`
- [ ] Backend .env tem `PORT=3001`
- [ ] Backend .env tem `CORS_ORIGIN` com URL do frontend
- [ ] `pm2 list` mostra processo rodando
- [ ] `netstat -tlnp | grep 3001` mostra porta aberta
- [ ] `curl localhost:3001` funciona no VPS
- [ ] Firewall permite porta 3001
- [ ] Backend escuta 0.0.0.0:3001, não 127.0.0.1:3001

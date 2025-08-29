# 🔧 CONFIGURAÇÃO CORS NO BACKEND - GUIA COMPLETO

## 📋 SITUAÇÃO ATUAL

**Frontend:** `https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev`  
**Backend VPS:** `http://178.156.157.146:3001`  
**Problema:** CORS não configurado - "Failed to fetch"

## 🎯 ARQUIVOS PARA CONFIGURAR NO VPS

### 1. **Backend .env** (~/CloudFarm/.env)

```env
# Porta do servidor
PORT=3001

# CORS - permitir frontend
CORS_ORIGIN=https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev

# Ambiente
NODE_ENV=production

# JWT (se usado)
JWT_SECRET=sua_chave_secreta_aqui

# Database (se aplicável)
DB_PATH=./cloudfarm.db
```

### 2. **Arquivo Principal** (~/CloudFarm/src/index.js)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// ⚠️ CORS DEVE VIR ANTES DE OUTROS MIDDLEWARES
app.use(cors({
  origin: [
    'https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev',
    'http://localhost:3000'  // Para desenvolvimento local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
}));

// Outros middlewares DEPOIS do CORS
app.use(express.json());

// Suas rotas aqui...
app.get('/', (req, res) => {
  res.json({ message: "CloudFarm API Server", status: "online" });
});

app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 Server running on port 3001');
});
```

## 🛠️ COMANDOS PARA EXECUTAR NO VPS

```bash
# 1. SSH no VPS
ssh root@178.156.157.146
cd ~/CloudFarm

# 2. Instalar cors se não tiver
npm install cors

# 3. Criar/editar .env
nano .env
# Adicionar as linhas do exemplo acima

# 4. Editar arquivo principal
nano src/index.js
# Adicionar configuração CORS do exemplo acima

# 5. Reiniciar servidor
pm2 restart cloudfarm-api

# 6. Verificar logs
pm2 logs cloudfarm-api --lines 10

# 7. Testar se funciona
curl -X OPTIONS http://localhost:3001 \
  -H "Origin: https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev" \
  -v
```

## ✅ VERIFICAÇÕES

### **1. Backend rodando:**
```bash
pm2 list
# Deve mostrar cloudfarm-api como 'online'
```

### **2. Porta acessível:**
```bash
netstat -tlnp | grep :3001
# Deve mostrar processo escutando na porta 3001
```

### **3. CORS configurado:**
```bash
curl -X OPTIONS http://localhost:3001 \
  -H "Origin: https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev" \
  -v
# Deve retornar headers Access-Control-Allow-*
```

### **4. API funcionando:**
```bash
curl http://localhost:3001
# Deve retornar: {"message":"CloudFarm API Server","status":"online"}
```

## 🚨 ERROS COMUNS

### **1. "Failed to fetch"**
- **Causa:** CORS não configurado
- **Solução:** Adicionar configuração CORS acima

### **2. "Network Error"**
- **Causa:** Firewall ou servidor offline
- **Solução:** `sudo ufw allow 3001` e `pm2 restart cloudfarm-api`

### **3. "CORS policy error"**
- **Causa:** Origin não permitido
- **Solução:** Verificar se URL do fly.dev está correta no CORS

## 🎯 CHECKLIST FINAL

- [ ] Arquivo .env criado com CORS_ORIGIN
- [ ] Configuração CORS adicionada em src/index.js  
- [ ] npm install cors executado
- [ ] pm2 restart cloudfarm-api executado
- [ ] Logs sem erros: pm2 logs cloudfarm-api
- [ ] Teste CORS passando: curl com OPTIONS
- [ ] Frontend conectando (🟢 Conectado)

---

## 🏃‍♂️ AÇÃO RÁPIDA

**Se quiser resolver agora mesmo:**

```bash
ssh root@178.156.157.146
cd ~/CloudFarm
npm install cors
echo 'CORS_ORIGIN=https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev' >> .env
# Editar src/index.js para adicionar configuração CORS
pm2 restart cloudfarm-api
```

**Depois teste o frontend - deve conectar! 🚀**

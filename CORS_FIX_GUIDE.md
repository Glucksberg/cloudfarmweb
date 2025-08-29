# 🔧 GUIA: Configurar CORS no CloudFarm Backend

## 🎯 PROBLEMA IDENTIFICADO

✅ **Backend CloudFarm:** Funcionando em `178.156.157.146:3001`  
✅ **Frontend:** Funcionando em `fly.dev`  
❌ **CORS:** Backend rejeita requests do fly.dev  

## 🚀 SOLUÇÃO: Configurar CORS no VPS

### 1️⃣ SSH no VPS
```bash
ssh root@178.156.157.146
cd ~/CloudFarm
```

### 2️⃣ Encontrar arquivo principal do servidor
```bash
# Procurar arquivo principal (pode ser app.js, server.js, index.js)
ls -la | grep -E "\.(js|ts)$"

# Ou procurar por arquivo que contém "listen" ou "port"
grep -r "listen.*3001" .
grep -r "port.*3001" .
```

### 3️⃣ Configurar CORS

**Opção A: Express com cors middleware**
```bash
# Editar arquivo principal
nano app.js  # ou server.js, ou index.js

# Adicionar no início:
# const cors = require('cors');
# app.use(cors({
#   origin: ['https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev', 'http://localhost:3000'],
#   credentials: true
# }));
```

**Opção B: Headers manuais**
```javascript
// Adicionar antes das rotas:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### 4️⃣ Instalar pacote cors (se necessário)
```bash
npm install cors
```

### 5️⃣ Reiniciar servidor
```bash
pm2 restart cloudfarm-api
pm2 logs cloudfarm-api --lines 20
```

### 6️⃣ Testar conexão
```bash
# Teste local (deve funcionar)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Markus","password":"Aquarela1989#"}'

# Teste CORS
curl -X OPTIONS http://178.156.157.146:3001/api/auth/login \
  -H "Origin: https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev"
```

## 🔄 ALTERNATIVAS

### Opção 1: Desenvolvimento Local (RECOMENDADO)
```bash
# No seu PC:
git clone [seu-repositorio]
cd cloudfarm-web
npm install
npm start
# Acesse: http://localhost:3000
```

### Opção 2: Proxy Temporário (JÁ IMPLEMENTADO)
O frontend agora tenta usar proxy CORS automaticamente como fallback.

## 📋 CHECKLIST

- [ ] SSH no VPS realizado
- [ ] Arquivo principal localizado  
- [ ] CORS configurado
- [ ] Servidor reiniciado
- [ ] Teste local funcionando
- [ ] Teste CORS passando
- [ ] Frontend conectando

## 🚨 SE NÃO FUNCIONAR

1. **Verificar logs:** `pm2 logs cloudfarm-api`
2. **Testar endpoint direto:** `curl http://178.156.157.146:3001/api/auth/login`
3. **Verificar sintaxe:** Erro no código pode quebrar o servidor
4. **Usar desenvolvimento local:** Sempre mais confiável

---

💡 **Dica:** CORS é necessário quando frontend e backend estão em domínios diferentes!

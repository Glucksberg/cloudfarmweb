# 🚨 BACKEND CLOUDFARM OFFLINE - SOLUÇÃO RÁPIDA

## ❌ Problema Detectado
O backend CloudFarm parou de funcionar (erro "Failed to fetch")

## ✅ SOLUÇÕES RÁPIDAS

### 1️⃣ REINICIAR BACKEND CLOUDFARM
```bash
# Navegue até o diretório do backend CloudFarm
cd /caminho/para/cloudfarm-backend

# Reinicie o servidor
node server.js
# ou 
npm start
# ou
node app.js
```

### 2️⃣ VERIFICAR SE ESTÁ RODANDO
```bash
# Teste se o backend está respondendo
curl http://localhost:3001/api/health

# Se não responder, tente outras portas
curl http://localhost:8080/api/health
curl http://localhost:3000/api/health
```

### 3️⃣ USAR DIAGNÓSTICO VISUAL
1. No frontend, clique em **"🧪 Testar Conexão"** (canto superior direito)
2. Clique em **"🔍 Procurar Portas"** para encontrar o backend
3. Siga as instruções mostradas

### 4️⃣ CORRIGIR CONFIGURAÇÃO SE NECESSÁRIO
Se o backend estiver em outra porta, edite `.env`:
```env
REACT_APP_CLOUDFARM_API_URL=http://localhost:PORTA_CORRETA/api
```

## 🎯 CAUSA MAIS COMUM
- **Backend parou de rodar** - Reinicie o script do servidor
- **Porta errada** - Verifique qual porta o backend está usando
- **Processo morreu** - Verifique se não há erro no código do backend

## 📋 VERIFICAÇÃO RÁPIDA
1. ✅ Backend CloudFarm está rodando?
2. ✅ Porta 3001 (ou 8080) está livre?
3. ✅ Arquivo .env tem a URL correta?
4. ✅ Console do backend mostra algum erro?

## 💡 DICA
O erro "Failed to fetch" SEMPRE indica que o backend não está acessível. 
A solução é sempre reiniciar o backend CloudFarm.

---
**🔄 Após resolver:** Recarregue a página (F5) para testar novamente

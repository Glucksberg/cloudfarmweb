# 🚀 CloudFarm Web - Deploy VPS

## 📋 Status Atual
- ✅ Frontend configurado para VPS
- ✅ HTTPS/SSL configurado no backend
- ✅ Configurações otimizadas para mesmo servidor
- ✅ WebSocket habilitado (WSS)

## 🎯 Deploy no VPS - Comandos Rápidos

### 1. Push para GitHub
```bash
git add .
git commit -m "feat: VPS deployment ready with HTTPS support"
git push origin flare-realm
```

### 2. Pull no VPS
```bash
ssh seu-usuario@178.156.157.146
cd ~/cloudfarmweb || git clone https://github.com/Glucksberg/cloudfarmweb.git && cd cloudfarmweb
git checkout flare-realm
git pull origin flare-realm
npm install
```

### 3. Configurar e Rodar
```bash
# Usar configuração do VPS
cp .env.production .env

# Rodar frontend
npm start  # Porta 3000

# Verificar backend
pm2 list  # Deve estar rodando na porta 3001
```

### 4. Acessar
- **Frontend**: http://178.156.157.146:3000
- **Backend**: https://178.156.157.146 (já configurado)

## ✅ Resultado Esperado
- 🟢 Status: "CloudFarm Conectado"
- 🗺️ Mapa carregando
- 📊 Dados mock dos talhões (T1, T2)
- 🔗 WebSocket funcionando

## 📁 Arquivos VPS
- `.env.production` - Configuração para VPS
- `ecosystem.config.js` - PM2 config (opcional)
- `VPS_DEPLOYMENT_GUIDE.md` - Guia completo

## 🔧 Próximos Passos
1. Teste no VPS
2. Configure PM2 para o frontend (produção)
3. Considere Nginx como proxy reverso
4. Configure domínio próprio (opcional)

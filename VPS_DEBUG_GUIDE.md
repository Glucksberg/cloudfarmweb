# 🔍 Debug CloudFarm VPS - Guia Completo

## 🎯 Problema Atual
- ✅ Frontend: Funcionando no fly.dev
- ✅ Firewall: Porta 3001 liberada
- ❌ Backend: Não responde externamente

## 🔍 1. Verificar se CloudFarm está rodando

```bash
# Ver processos PM2
pm2 list

# Ver logs do CloudFarm
pm2 logs cloudfarm-api --lines 50

# Ver se processo existe
ps aux | grep node
```

## 🔍 2. Verificar porta 3001

```bash
# Ver o que está rodando na porta 3001
netstat -tulnp | grep :3001
# ou
ss -tulnp | grep :3001

# Testar localhost dentro do VPS
curl http://localhost:3001/api/health
curl http://127.0.0.1:3001/api/health
```

## 🔍 3. Verificar configuração do CloudFarm

O problema mais comum é o backend rodar só em `localhost` (127.0.0.1) e não aceitar conexões externas.

### 📋 Verificar arquivo de configuração:
```bash
cd ~/CloudFarm
cat package.json | grep start
cat .env 2>/dev/null || echo "Sem .env"

# Procurar arquivos de config
find . -name "*.js" -exec grep -l "listen\|bind\|host" {} \;
```

### 🔧 Configuração correta para aceitar conexões externas:

O servidor deve estar configurado assim:
```javascript
// ❌ ERRADO - só localhost
app.listen(3001, 'localhost')
app.listen(3001, '127.0.0.1')

// ✅ CORRETO - aceita conexões externas  
app.listen(3001, '0.0.0.0')
app.listen(3001) // sem especificar host
```

## 🔍 4. Comandos de teste completo

Execute no VPS:
```bash
echo "=== 1. STATUS PM2 ==="
pm2 list

echo "=== 2. PORTAS EM USO ==="
netstat -tulnp | grep :3001

echo "=== 3. TESTE LOCAL ==="
curl -v http://localhost:3001/api/health

echo "=== 4. FIREWALL ==="
sudo ufw status | grep 3001

echo "=== 5. LOGS CLOUDFRM ==="
pm2 logs cloudfarm-api --lines 10
```

## 🚀 5. Soluções possíveis

### A. Se CloudFarm não está rodando:
```bash
cd ~/CloudFarm
pm2 start ecosystem.config.js
# ou
pm2 start app.js --name cloudfarm-api
```

### B. Se está rodando só em localhost:
Encontrar e editar o arquivo principal do servidor para usar `0.0.0.0`:
```bash
# Encontrar arquivo principal
grep -r "listen.*3001" ~/CloudFarm/
# Editar para usar 0.0.0.0 em vez de localhost
```

### C. Reiniciar após mudanças:
```bash
pm2 restart cloudfarm-api
pm2 logs cloudfarm-api --lines 20
```

## 🔧 6. Se nada funcionar - Configuração de emergência

Criar um proxy simples para aceitar conexões externas:
```bash
# Instalar nginx (se não tiver)
sudo apt update && sudo apt install nginx

# Configurar proxy reverso
sudo nano /etc/nginx/sites-available/cloudfarm

# Adicionar:
# server {
#     listen 3001;
#     location / {
#         proxy_pass http://127.0.0.1:PORTA_REAL_CLOUDFARM;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#     }
# }

sudo ln -s /etc/nginx/sites-available/cloudfarm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ⚡ PRÓXIMOS PASSOS

1. Execute os comandos de teste completo
2. Cole aqui os resultados
3. Ajustaremos a configuração conforme necessário

O problema está no VPS, não no frontend!

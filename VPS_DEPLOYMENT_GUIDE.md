# 🚀 Guia de Deploy no VPS

## 📋 Checklist Pré-Deploy

Antes de fazer o push, confirme que tem:
- ✅ Todas as mudanças salvas
- ✅ Configuração para VPS criada (.env.production)
- ✅ Backend rodando no VPS (porta 3001)

## 🔄 Passo 1: Push para GitHub

```bash
# Fazer push das alterações para atualizar o PR
git add .
git commit -m "feat: Configure HTTPS + VPS deployment ready"
git push origin flare-realm
```

Isso vai atualizar automaticamente o Pull Request #1.

## 📥 Passo 2: Pull no VPS

```bash
# SSH para o VPS
ssh seu-usuario@178.156.157.146

# Ir para o diretório do projeto (ou clonar se não existe)
cd ~

# Se não tem o projeto ainda:
git clone https://github.com/Glucksberg/cloudfarmweb.git
cd cloudfarmweb

# Se já tem o projeto:
cd cloudfarmweb
git checkout flare-realm
git pull origin flare-realm

# Instalar dependências
npm install
```

## ⚙️ Passo 3: Configurar Ambiente VPS

```bash
# Copiar configuração do VPS
cp .env.production .env

# Verificar se está correto
cat .env

# Deve mostrar:
# REACT_APP_CLOUDFARM_API_URL=http://localhost:3001/api
# REACT_APP_CLOUDFARM_WS_URL=ws://localhost:3001/ws
```

## 🚀 Passo 4: Rodar Frontend no VPS

```bash
# Opção 1: Desenvolvimento (recomendado para teste)
npm start  # Roda na porta 3000

# Opção 2: Build + Serve (produção)
npm run build
npx serve -s build -l 3000
```

## 🔍 Passo 5: Verificar Funcionamento

```bash
# Verificar se backend está rodando
pm2 list  # Deve mostrar cloudfarm-api online

# Verificar portas
netstat -tlnp | grep -E "3000|3001"
# Deve mostrar:
# :3000 (frontend)
# :3001 (backend)

# Testar no navegador
# http://178.156.157.146:3000
```

## 🎯 Resultado Esperado

Quando tudo estiver funcionando:
- ✅ Frontend: `http://178.156.157.146:3000`
- ✅ Backend: `http://178.156.157.146:3001`
- ✅ Status: 🟢 "CloudFarm Conectado"
- ✅ WebSocket funcionando
- ✅ Mapa carregando
- ✅ Talhões mock aparecendo

## 🆘 Troubleshooting

### Frontend não inicia:
```bash
# Verificar logs
npm start --verbose

# Verificar porta disponível
sudo lsof -i :3000
```

### Backend não conecta:
```bash
# Verificar se backend está rodando
pm2 status cloudfarm-api
pm2 logs cloudfarm-api

# Reiniciar se necessário
pm2 restart cloudfarm-api
```

### Firewall bloqueando:
```bash
# Permitir porta 3000 também
sudo ufw allow 3000
sudo ufw status
```

## 📞 Próximos Passos

Após rodar no VPS com sucesso:
1. Teste todas as funcionalidades
2. Se funcionar bem, considere usar PM2 para o frontend também
3. Configure Nginx para proxy reverso (opcional)
4. Configure domínio próprio (opcional)

## 💡 Dicas

- Use `screen` ou `tmux` para manter processos rodando
- Configure PM2 para o frontend em produção
- Monitor logs regularmente
- Faça backup antes de mudanças grandes

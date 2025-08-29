# 🚀 Setup Rápido - Desenvolvimento Local

## 🚨 Problema: Mixed Content Security
Sua página HTTPS não pode acessar HTTP backend. **Solução: desenvolvimento local.**

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Backend Local

#### Opção A: Clonar e Rodar Backend
```bash
# Clone o projeto backend (substitua pela URL real)
git clone https://github.com/seu-usuario/cloudfarm-backend.git
cd cloudfarm-backend

# Instalar dependências
npm install

# Configurar .env local
echo "PORT=3001" > .env
echo "CORS_ORIGIN=https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev" >> .env

# Rodar backend
npm start
```

#### Opção B: Criar Backend Mínimo (se não tiver código)
```bash
# Criar diretório
mkdir cloudfarm-backend
cd cloudfarm-backend

# Inicializar projeto
npm init -y
npm install express cors dotenv

# Criar backend básico
cat > index.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev',
  credentials: true
}));

app.use(express.json());

// Rotas básicas
app.get('/', (req, res) => {
  res.json({ 
    status: 'CloudFarm Local API', 
    timestamp: new Date().toISOString(),
    mode: 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0-local' });
});

// Mock endpoints para talhões
app.get('/api/talhoes', (req, res) => {
  res.json([
    { id: 1, nome: 'T1', area: 100, cultura: 'Soja', status: 'plantado' },
    { id: 2, nome: 'T2', area: 150, cultura: 'Milho', status: 'livre' }
  ]);
});

app.post('/api/talhoes', (req, res) => {
  const newTalhao = { id: Date.now(), ...req.body };
  res.json(newTalhao);
});

app.listen(PORT, () => {
  console.log(`🚀 CloudFarm API Local rodando em http://localhost:${PORT}`);
  console.log(`📡 CORS configurado para: ${process.env.CORS_ORIGIN}`);
});
EOF

# Criar .env
echo "PORT=3001" > .env
echo "CORS_ORIGIN=https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev" >> .env

# Rodar
node index.js
```

### Passo 2: Verificar Backend Funciona
```bash
# Testar em nova aba do terminal
curl http://localhost:3001/api/health

# Deve retornar: {"status":"healthy","version":"1.0.0-local"}
```

### Passo 3: Frontend Já Configurado ✅
O frontend já foi configurado para usar `localhost:3001`. **Apenas recarregue a página!**

## 🎯 Verificar Se Funcionou

1. ✅ Backend rodando: `http://localhost:3001/api/health` responde
2. ✅ Recarregue a página do CloudFarm
3. ✅ Status deve mudar de vermelho para verde
4. ✅ Não deve ter mais erros de Mixed Content

## 🆘 Problemas Comuns

### Erro: "Port 3001 already in use"
```bash
# Matar processo na porta 3001
killall -9 node
# ou
npx kill-port 3001

# Tentar novamente
node index.js
```

### Erro: "CORS still blocked"
Verifique se o `.env` tem a URL correta:
```bash
# .env deve ter exatamente:
CORS_ORIGIN=https://5da848bc6f7946baad3a1ce917824153-1e6652fa-c9f2-4111-8da6-22f2da.fly.dev
```

### Erro: "Cannot reach localhost"
- Certifique-se que o backend está rodando (`node index.js`)
- Verifique se não há firewall bloqueando porta 3001
- Teste: `curl http://localhost:3001/`

## 🔄 Próximos Passos

1. **Agora**: Use desenvolvimento local (mais rápido)
2. **Depois**: Configure SSL no VPS para produção
3. **Futuro**: Use CI/CD para deploy automático

## 📞 Need Help?

Se ainda não funcionar:
1. Compartilhe os logs do backend (`node index.js`)
2. Compartilhe os erros do browser console
3. Verifique se `http://localhost:3001/api/health` funciona

**IMPORTANTE**: Mantenha o terminal com `node index.js` rodando enquanto usa a aplicação!

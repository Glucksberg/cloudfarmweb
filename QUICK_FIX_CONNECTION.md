# 🚨 GUIA RÁPIDO: Resolver "Failed to fetch"

## ✅ O QUE FOI FEITO

1. **Arquivo .env criado** com configuração padrão
2. **Melhor tratamento de erro** no authService  
3. **Componente de diagnóstico** adicionado (canto superior direito)
4. **Logs detalhados** para debug

## 🔧 SOLUÇÕES RÁPIDAS

### 1️⃣ VERIFICAR SE BACKEND ESTÁ RODANDO

```bash
# Teste básico de conectividade
curl http://localhost:3001/api/health

# Ou teste na porta 8080 (VPS CloudFarm)
curl http://localhost:8080/api/health
```

### 2️⃣ CONFIGURAR URL CORRETA NO .ENV

Edite o arquivo `.env` na raiz do projeto:

```env
# Para desenvolvimento local (backend na porta 3001)
REACT_APP_CLOUDFARM_API_URL=http://localhost:3001/api

# Para VPS CloudFarm (backend na porta 8080)
REACT_APP_CLOUDFARM_API_URL=http://SEU_VPS_IP:8080/api
```

### 3️⃣ USAR O DIAGNÓSTICO NO FRONTEND

1. Abra o frontend no browser
2. Clique no botão **"🧪 Testar Conexão"** (canto superior direito)
3. Veja o resultado e siga as instruções

### 4️⃣ REINICIAR SERVIÇOS

```bash
# Reiniciar frontend (para carregar .env)
Ctrl+C
npm start

# Reiniciar backend CloudFarm
# (comando específico do seu ambiente)
```

## 📋 CONFIGURAÇÕES COMUNS

| Ambiente | URL da API | WebSocket |
|----------|------------|-----------|
| **Desenvolvimento** | `http://localhost:3001/api` | `ws://localhost:3001/ws` |
| **VPS CloudFarm** | `http://IP_VPS:8080/api` | `ws://IP_VPS:8080/ws` |
| **Docker** | `http://localhost:3000/api` | `ws://localhost:3000/ws` |

## 🐛 DEBUG AVANÇADO

### Ver logs detalhados:
1. Abra **DevTools** (F12)
2. Vá para **Console**
3. Tente fazer login
4. Veja mensagens começando com 🔌 e ❌

### Testar endpoints manualmente:
```bash
# Health check
curl http://localhost:3001/api/health

# Login (teste)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 🚀 APÓS RESOLVER

**Remover componente de diagnóstico:**
- Edite `src/components/Layout.js`
- Remova a linha `<ConnectionDiagnostic />`
- Remova o import do `ConnectionDiagnostic`

---

**💡 Dica:** O erro mais comum é o backend não estar rodando ou estar em uma porta diferente da configurada no .env

# CloudFarm API - Guia de Integração Frontend

## Visão Geral

Este documento fornece todas as informações necessárias para integrar o frontend com a API CloudFarm, incluindo autenticação JWT e conexões WebSocket em tempo real.

## 🚀 Como Iniciar o Backend

Para iniciar o servidor da API:

```bash
cd /root/CloudFarm
node test-api.js
```

O servidor irá iniciar em:
- **API**: `http://localhost:3001`
- **WebSocket**: `ws://localhost:3001/ws`
- **Documentação**: `http://localhost:3001/api/docs`
- **Stats WebSocket**: `http://localhost:3001/api/ws/stats`

## 🔑 Credenciais para Teste

**IMPORTANTE**: A API usa o mesmo banco de dados do CloudFarm principal. Para testar, você precisará de:

1. **Usuário existente** no sistema CloudFarm
2. **Senha** do usuário
3. O usuário deve estar **ativo** (`active: true`)

### Exemplo de Teste
Se você tem um usuário no sistema:
```json
{
  "email": "admin@fazenda.com",
  "password": "suaSenhaReal"
}
```

### Criar Usuário para Teste (se necessário)
Se precisar criar um usuário de teste, use o sistema Telegram existente do CloudFarm ou acesse diretamente o MongoDB.

## 🔐 Autenticação JWT

### Endpoints de Autenticação

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "roles": ["admin", "super_admin"],
      "hierarchy": "super_admin",
      "farm_id": "507f1f77bcf86cd799439012",
      "sector": "Administração"
    },
    "expiresIn": 86400
  }
}
```

#### 2. Obter Informações do Usuário
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 3. Renovar Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

#### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Hierarquias e Roles

| Hierarquia CloudFarm | Roles Frontend | Permissões |
|---------------------|----------------|------------|
| `super_admin` | `["admin", "super_admin"]` | Acesso total |
| `master` | `["admin", "master"]` | Administração geral |
| `gerente` | `["manager", "user"]` | Gerenciamento de fazenda |
| `funcionario` | `["user"]` | Operações básicas |

## 🌐 WebSocket em Tempo Real

### Conexão WebSocket

```javascript
// Conectar ao WebSocket com token JWT
const token = localStorage.getItem('jwt_token');
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

// Ou via header Authorization (se suportado pelo cliente)
const ws = new WebSocket('ws://localhost:3001/ws', [], {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Mensagens WebSocket

#### 1. Mensagem de Boas-vindas
```json
{
  "type": "welcome",
  "data": {
    "clientId": "client_1234567890_abc123",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "role": "super_admin",
      "farms": [
        { "id": "farm123", "name": "Fazenda São João" }
      ]
    }
  }
}
```

#### 2. Ping/Pong (Heartbeat)
```javascript
// Enviar ping
ws.send(JSON.stringify({ type: 'ping' }));

// Receber pong
{
  "type": "pong",
  "timestamp": 1640995200000
}
```

#### 3. Inscrever-se em Canal
```javascript
// Inscrever-se em canal público
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'public.notifications'
}));

// Inscrever-se em canal de fazenda específica
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'farm.507f1f77bcf86cd799439012'
}));
```

#### 4. Enviar Mensagem para Canal
```javascript
ws.send(JSON.stringify({
  type: 'message',
  channel: 'public.chat',
  data: {
    message: 'Olá pessoal!',
    timestamp: Date.now()
  }
}));
```

### Tipos de Canais

| Prefixo | Descrição | Permissão Necessária |
|---------|-----------|---------------------|
| `public.*` | Canais públicos | Todos os usuários |
| `farm.{farmId}` | Canais de fazenda específica | Usuários da fazenda |
| `admin.*` | Canais administrativos | `super_admin`, `master` |
| `management.*` | Canais de gerência | `super_admin`, `master`, `gerente` |

### Exemplos de Canais

```javascript
// Canais públicos
'public.notifications'    // Notificações gerais
'public.chat'            // Chat público
'public.alerts'          // Alertas do sistema

// Canais de fazenda
'farm.507f1f77bcf86cd799439012'  // Fazenda específica
'farm.507f1f77bcf86cd799439012.machines'  // Máquinas da fazenda
'farm.507f1f77bcf86cd799439012.weather'   // Clima da fazenda

// Canais administrativos
'admin.system'           // Sistema administrativo
'admin.users'            // Gerenciamento de usuários

// Canais de gerência
'management.reports'     // Relatórios gerenciais
'management.operations'  // Operações
```

## 📡 Exemplo de Implementação Frontend

### React Hook para WebSocket

```javascript
import { useState, useEffect, useRef } from 'react';

const useWebSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Conectar WebSocket
    ws.current = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

    ws.current.onopen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Mensagem recebida:', message);
      
      if (message.type === 'channel_message') {
        setMessages(prev => [...prev, message]);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('Erro WebSocket:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, [token]);

  const sendMessage = (type, data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, ...data }));
    }
  };

  const subscribeToChannel = (channel) => {
    sendMessage('subscribe', { channel });
  };

  const unsubscribeFromChannel = (channel) => {
    sendMessage('unsubscribe', { channel });
  };

  const sendChannelMessage = (channel, data) => {
    sendMessage('message', { channel, data });
  };

  return {
    isConnected,
    messages,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendChannelMessage
  };
};

export default useWebSocket;
```

### Serviço de Autenticação

```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.token = localStorage.getItem('jwt_token');
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        localStorage.setItem('jwt_token', this.token);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
    } finally {
      this.token = null;
      localStorage.removeItem('jwt_token');
    }
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    const data = await response.json();
    return data.success ? data.data.user : null;
  }

  async refreshToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('jwt_token', this.token);
      return data.data.token;
    }
    
    throw new Error('Falha ao renovar token');
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export default new AuthService();
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente Necessárias

```env
# API Configuration
CLOUDFARM_API_URL=http://localhost:3001
API_PORT=3001

# JWT Configuration
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=24h

# Para testar, use as mesmas variáveis do CloudFarm principal

# Database
MONGODB_URI=mongodb://localhost:27017/cloudfarm

# Environment
NODE_ENV=development
LOG_LEVEL=info
```

## 📊 Estatísticas do WebSocket

```http
GET /api/ws/stats
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "connectedClients": 15,
    "activeChannels": 8,
    "channels": [
      {
        "name": "public.notifications",
        "subscribers": 12
      },
      {
        "name": "farm.507f1f77bcf86cd799439012",
        "subscribers": 5
      }
    ]
  }
}
```

## 🚨 Tratamento de Erros

### Códigos de Status HTTP

| Código | Descrição |
|--------|----------|
| 200 | Sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

### Erros WebSocket

```json
{
  "type": "error",
  "message": "Access denied to channel: admin.system"
}
```

## 🔒 Segurança

1. **Sempre use HTTPS em produção**
2. **Armazene tokens JWT de forma segura**
3. **Implemente renovação automática de tokens**
4. **Valide permissões no frontend e backend**
5. **Use WSS (WebSocket Secure) em produção**

## 📝 Notas Importantes

- Tokens JWT expiram em 24 horas por padrão
- WebSocket reconecta automaticamente em caso de desconexão
- Canais são case-sensitive
- Máximo de 50 canais por cliente
- Heartbeat a cada 15 segundos
- Timeout de conexão: 30 segundos

## 🧪 Testando a Integração

### Teste Básico da API

```bash
# Testar se o servidor está rodando
curl http://localhost:3001/api/docs

# Testar login (substitua por credenciais reais do seu sistema)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teste.com","password":"123456"}'

# Testar WebSocket stats
curl http://localhost:3001/api/ws/stats
```

### Teste do WebSocket via JavaScript (Console do Browser)

```javascript
// Conectar ao WebSocket (substitua pelo token real)
const ws = new WebSocket('ws://localhost:3001/ws?token=SEU_JWT_TOKEN_AQUI');

ws.onopen = () => console.log('WebSocket conectado!');
ws.onmessage = (event) => console.log('Recebido:', JSON.parse(event.data));

// Inscrever em canal público
ws.send(JSON.stringify({ type: 'subscribe', channel: 'public.chat' }));

// Enviar mensagem
ws.send(JSON.stringify({ 
  type: 'message', 
  channel: 'public.chat', 
  data: { message: 'Teste do frontend!' } 
}));
```

### Logs do Servidor

O servidor exibe logs úteis no console:
- Conexões WebSocket
- Autenticação
- Inscrições em canais
- Erros de conexão

## 📋 Checklist de Integração

- [ ] Backend iniciado com `node test-api.js`
- [ ] Login funcionando em `/api/auth/login`
- [ ] WebSocket conectando em `ws://localhost:3001/ws?token=TOKEN`
- [ ] Mensagem de boas-vindas recebida
- [ ] Subscribe/unsubscribe em canais funcionando
- [ ] Troca de mensagens entre clientes funcionando

Este documento fornece todas as informações necessárias para implementar a integração completa com a API CloudFarm. Para dúvidas específicas, consulte os logs do servidor ou entre em contato com a equipe de desenvolvimento.
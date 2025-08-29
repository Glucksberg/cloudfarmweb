# Arquitetura de Autenticação JWT - CloudFarm Web

## Visão Geral

Este documento descreve a implementação de um sistema unificado de autenticação entre o frontend web e o backend CloudFarm, utilizando tokens JWT para autorização e acesso aos recursos.

## Fluxo de Autenticação

### 1. Login do Usuário
```
Frontend → [POST] /api/auth/login → CloudFarm Backend
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}

CloudFarm Backend → Frontend
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 123,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "roles": ["user", "admin"]
  },
  "expiresIn": 3600
}
```

### 2. Armazenamento do Token
- **LocalStorage**: Para persistência entre sessões
- **Memory**: Para acesso rápido durante a sessão
- **Renovação automática**: Antes da expiração

### 3. Requisições Autenticadas
```
Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "Content-Type": "application/json"
}
```

### 4. WebSocket Autenticado
```javascript
const ws = new WebSocket('ws://backend/ws?token=eyJhbGciOiJIUzI1NiIs...');
```

## Estrutura do Frontend

### AuthService (`src/services/authService.js`)
```javascript
class AuthService {
  // Login/logout
  login(email, password)
  logout()
  
  // Token management
  getToken()
  setToken(token)
  removeToken()
  isTokenValid()
  
  // User info
  getCurrentUser()
  hasRole(role)
}
```

### AuthContext (`src/contexts/AuthContext.js`)
```javascript
const AuthContext = {
  user: null,
  isAuthenticated: false,
  login: (email, password) => {},
  logout: () => {},
  loading: false
}
```

### Componentes
- `LoginPage/LoginModal`: Interface de login
- `ProtectedRoute`: Wrapper para rotas protegidas
- `AuthGuard`: Verificação de permissões

## Modificações no Backend CloudFarm

### Novos Endpoints
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Middleware de Autenticação
- Verificação de JWT em todas as rotas protegidas
- Extração de informações do usuário do token
- Renovação automática de tokens

### WebSocket Authentication
```go
// Exemplo em Go
func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request) {
    token := r.URL.Query().Get("token")
    if !h.validateJWT(token) {
        http.Error(w, "Unauthorized", 401)
        return
    }
    // Estabelecer conexão WebSocket
}
```

## Estrutura do Token JWT

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json
{
  "sub": "123",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "roles": ["user", "admin"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Integração com Componentes Existentes

### CloudFarmAPI Service
```javascript
// Modificação para incluir token automaticamente
class CloudFarmAPI {
  constructor() {
    this.authService = new AuthService();
  }
  
  async makeRequest(url, options = {}) {
    const token = this.authService.getToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    return fetch(url, { ...options, headers });
  }
}
```

### Talhoes Page
```javascript
// Verificar autenticação antes de carregar dados
const TalhoesPage = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginRequired />;
  }
  
  // Resto do componente...
};
```

## Estados de Autenticação

### Loading States
- `CHECKING`: Verificando token existente
- `LOGGING_IN`: Processo de login em andamento
- `AUTHENTICATED`: Usuário autenticado
- `UNAUTHENTICATED`: Usuário não autenticado

### Error Handling
- Token expirado → Renovação automática ou logout
- Credenciais inválidas → Mensagem de erro
- Erro de rede → Retry com backoff

## Segurança

### Frontend
- Token armazenado de forma segura
- Limpeza automática em logout
- Verificação de expiração antes de requisições

### Backend
- Validação rigorosa de JWT
- Rate limiting em endpoints de auth
- Logs de tentativas de login
- Blacklist de tokens revogados

## Implementação Faseada

### Fase 1: Autenticação Básica
1. AuthService básico
2. LoginPage simples
3. Armazenamento de token

### Fase 2: Integração
1. AuthContext global
2. Proteção de rotas
3. Integração com API existente

### Fase 3: WebSocket Auth
1. Autenticação WebSocket
2. Reconexão automática com token
3. Renovação de token em tempo real

### Fase 4: Refinamentos
1. Renovação automática de token
2. Remember me functionality
3. Multi-device logout

## Próximos Passos

1. **Definir especificação do backend** - Endpoints e estrutura de dados
2. **Implementar AuthService** - Gerenciamento de tokens e login
3. **Criar AuthContext** - Estado global de autenticação
4. **Implementar LoginPage** - Interface de usuário
5. **Integrar com APIs existentes** - Adicionar autenticação às chamadas
6. **Testar fluxo completo** - End-to-end testing

Esta arquitetura garante uma integração segura e seamless entre o frontend e o CloudFarm backend, mantendo a flexibilidade para futuras expansões.

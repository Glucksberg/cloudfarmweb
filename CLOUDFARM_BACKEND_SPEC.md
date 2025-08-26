# CloudFarm Backend API Specification

Este documento especifica os endpoints e funcionalidades que precisam ser implementados no VPS CloudFarm para integração com o frontend web.

## 📡 Configuração de Rede

### Requisitos de Conectividade
- **Porta HTTP/API**: `8080` (recomendado)
- **Porta WebSocket**: `8080` (mesmo servidor, endpoint `/ws`)
- **Protocolo**: HTTP/1.1 + WebSocket
- **CORS**: Habilitado para domínio do frontend

### URLs de Exemplo
```
API REST: http://SEU_VPS_IP:8080/api
WebSocket: ws://SEU_VPS_IP:8080/ws
```

## 🗃️ Estrutura de Dados

### Talhão (Objeto Principal)
```json
{
  "id": "string|number", // ID único do talhão
  "nome": "string", // Nome do talhão (ex: "T1", "Retiro Norte")
  "area_hectares": "float", // Área em hectares
  "cultura_atual": "string", // Cultura atual (ex: "Soja", "Milho", "Algodão")
  "variedade": "string", // Variedade plantada (ex: "TMG 7262")
  "grupo_maturacao": "string|null", // Grupo de maturação (soja) ou precocidade (milho)
  "data_plantio": "ISO8601|null", // Data de plantio (ex: "2024-01-15T00:00:00Z")
  "colheita_estimada": "ISO8601|null", // Data estimada de colheita
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[longitude, latitude], ...]] // Coordenadas do polígono
  },
  "observacoes": "string", // Observações adicionais
  "created_at": "ISO8601", // Data de criação
  "updated_at": "ISO8601" // Data de última atualização
}
```

### Status Derivado (Calculado automaticamente)
O frontend calcula o status baseado nas datas:
- `livre`: Sem plantio ou colheita concluída
- `plantado`: Com plantio e dentro do período de crescimento
- `planejado`: Plantio futuro agendado
- `colheita`: Período de colheita

## 🔐 Autenticação JWT

### Estrutura do Token JWT

#### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload
```json
{
  "sub": "123",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "roles": ["user", "admin"],
  "farm_id": "farm_001",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Middleware de Autenticação
Todas as rotas protegidas devem verificar o token JWT no header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🔗 Endpoints REST API

### 🔐 Autenticação

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta Sucesso:** (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 123,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "roles": ["user", "admin"],
    "farm_id": "farm_001",
    "farm_name": "Fazenda São José"
  },
  "expiresIn": 3600
}
```

**Resposta Erro:** (401 Unauthorized)
```json
{
  "success": false,
  "error": "Credenciais inválidas",
  "code": "INVALID_CREDENTIALS"
}
```

#### 2. Logout
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Resposta:** (200 OK)
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### 3. Renovar Token
```http
POST /api/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Resposta:** (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

#### 4. Informações do Usuário
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Resposta:** (200 OK)
```json
{
  "id": 123,
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "roles": ["user", "admin"],
  "farm_id": "farm_001",
  "farm_name": "Fazenda São José",
  "last_login": "2024-01-20T08:30:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 📊 Dados Principais

### 1. Health Check
```http
GET /api/health
```
**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### 2. Listar Talhões
```http
GET /api/talhoes
```
**Resposta:**
```json
[
  {
    "id": "t1",
    "nome": "Talhão 1",
    "area_hectares": 145.5,
    "cultura_atual": "Soja",
    "variedade": "TMG 7262",
    "grupo_maturacao": "6.2",
    "data_plantio": "2024-01-15T00:00:00Z",
    "colheita_estimada": "2024-05-15T00:00:00Z",
    "geometry": {
      "type": "Polygon", 
      "coordinates": [[[-47.123, -15.456], [-47.122, -15.456], ...]]
    },
    "observacoes": "Primeira plantação da safra",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
]
```

### 3. Criar Talhão
```http
POST /api/talhoes
Content-Type: application/json

{
  "nome": "Talhão Novo",
  "area_hectares": 200.0,
  "cultura_atual": "Milho",
  "variedade": "Pioneer 30F53",
  "grupo_maturacao": "Precoce",
  "data_plantio": "2024-02-01T00:00:00Z",
  "colheita_estimada": "2024-07-01T00:00:00Z",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[-47.130, -15.470], [-47.129, -15.470], ...]]
  },
  "observacoes": "Talhão criado via interface web"
}
```

**Resposta:** (201 Created)
```json
{
  "id": "t15",
  "nome": "Talhão Novo",
  "area_hectares": 200.0,
  "cultura_atual": "Milho",
  "variedade": "Pioneer 30F53",
  "grupo_maturacao": "Precoce",
  "data_plantio": "2024-02-01T00:00:00Z",
  "colheita_estimada": "2024-07-01T00:00:00Z",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[-47.130, -15.470], [-47.129, -15.470], ...]]
  },
  "observacoes": "Talhão criado via interface web",
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-01-20T10:30:00Z"
}
```

### 4. Atualizar Talhão
```http
PUT /api/talhoes/{id}
Content-Type: application/json

{
  "nome": "Talhão Atualizado",
  "area_hectares": 205.5,
  "cultura_atual": "Soja",
  "variedade": "OLIMPO",
  "grupo_maturacao": "5.8",
  "data_plantio": "2024-02-10T00:00:00Z",
  "colheita_estimada": "2024-06-10T00:00:00Z",
  "observacoes": "Alteração de cultura"
}
```

**Resposta:** (200 OK) - Objeto atualizado completo

### 5. Deletar Talhão
```http
DELETE /api/talhoes/{id}
```

**Resposta:** (204 No Content)

### 6. Estatísticas
```http
GET /api/estatisticas
```

**Resposta:**
```json
{
  "total_talhoes": 15,
  "area_total": 2450.5,
  "talhoes_plantados": 8,
  "talhoes_livres": 7,
  "culturas": ["Soja", "Milho", "Algodão"],
  "producao_estimada": {
    "soja": 1200.5,
    "milho": 800.3
  },
  "ultima_atualizacao": "2024-01-20T10:30:00Z"
}
```

## 🔄 WebSocket (Tempo Real)

### Conexão Autenticada
```javascript
// Frontend conecta com token JWT:
const token = "eyJhbGciOiJIUzI1NiIs...";
const ws = new WebSocket(`ws://SEU_VPS_IP:8080/ws?token=${token}`);
```

### Validação de Conexão
O servidor deve validar o token JWT antes de aceitar a conexão WebSocket:
- Token válido → Conexão aceita
- Token inválido/ausente → Conexão recusada (código 1008)

### Mensagens de Erro de Autenticação
```json
{
  "type": "auth_error",
  "error": "Token JWT inválido ou expirado",
  "code": "INVALID_TOKEN"
}
```

### Mensagens do Cliente para Servidor

#### Inscrever em Tópicos
```json
{
  "type": "subscribe",
  "topics": ["talhoes", "plantios", "colheitas"]
}
```

### Mensagens do Servidor para Cliente

#### Talhão Criado
```json
{
  "type": "talhao_created",
  "data": {
    "id": "t16",
    "nome": "Novo Talhão",
    // ... dados completos do talhão
  }
}
```

#### Talhão Atualizado
```json
{
  "type": "talhao_updated", 
  "data": {
    "id": "t5",
    "nome": "Talhão Modificado",
    // ... dados completos atualizados
  }
}
```

#### Talhão Deletado
```json
{
  "type": "talhao_deleted",
  "data": {
    "id": "t12"
  }
}
```

#### Plantio Iniciado
```json
{
  "type": "plantio_iniciado",
  "data": {
    "talhao_id": "t5",
    "cultura": "Soja",
    "variedade": "TMG 7262",
    "data_plantio": "2024-01-20T08:00:00Z",
    "colheita_estimada": "2024-05-20T00:00:00Z"
  }
}
```

#### Colheita Concluída
```json
{
  "type": "colheita_concluida",
  "data": {
    "talhao_id": "t8",
    "data_colheita": "2024-01-20T16:00:00Z",
    "producao_real": 245.8
  }
}
```

## 🛠️ Implementação Sugerida

### Tecnologias Recomendadas
- **Node.js + Express**: API REST simples
- **ws**: WebSocket para tempo real  
- **SQLite/PostgreSQL**: Banco de dados
- **dotenv**: Configuração via variáveis de ambiente

### Estrutura de Pastas Sugerida
```
cloudfarm-api/
├── src/
│   ├── controllers/
│   │   ├── talhoes.js
│   │   └── estatisticas.js
│   ├── models/
│   │   └── talhao.js
│   ├── routes/
│   │   └── api.js
│   ├── websocket/
│   │   └── handler.js
│   └── app.js
├── package.json
└── .env
```

### Configuração Inicial (.env)
```env
PORT=8080
DB_PATH=./cloudfarm.db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### Exemplo Básico (Node.js + Express)
```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const talhoeRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', talhoeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`CloudFarm API rodando na porta ${PORT}`);
});

// WebSocket Server
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        // Lógica de inscrição em tópicos
        console.log('Cliente inscrito em:', data.topics);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
});

// Função para broadcast de eventos
function broadcastEvent(type, data) {
  const message = JSON.stringify({ type, data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { app, broadcastEvent };
```

## 🧪 Testes

### Teste Manual com curl
```bash
# Health check
curl http://SEU_VPS_IP:8080/api/health

# Listar talhões
curl http://SEU_VPS_IP:8080/api/talhoes

# Criar talhão
curl -X POST http://SEU_VPS_IP:8080/api/talhoes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste API",
    "area_hectares": 100.0,
    "cultura_atual": "Soja",
    "variedade": "Test",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[-47.1, -15.4], [-47.0, -15.4], [-47.0, -15.5], [-47.1, -15.5], [-47.1, -15.4]]]
    }
  }'
```

### Teste WebSocket
```javascript
// Teste no browser console
const ws = new WebSocket('ws://SEU_VPS_IP:8080/ws');
ws.onopen = () => console.log('Conectado');
ws.onmessage = (e) => console.log('Mensagem:', JSON.parse(e.data));
ws.send(JSON.stringify({type: 'subscribe', topics: ['talhoes']}));
```

## 🔒 Segurança (Futura)

Para versões futuras, considerar:
- **Autenticação JWT**: Tokens de acesso
- **Rate Limiting**: Limitação de requisições
- **HTTPS/WSS**: Certificados SSL
- **Validação de Dados**: Sanitização de entrada
- **Logs de Auditoria**: Registro de operações

## 📚 Bibliotecas Úteis

### Node.js
```bash
npm install express cors ws sqlite3 dotenv
npm install --save-dev nodemon
```

### Python (alternativa)
```bash
pip install fastapi uvicorn websockets sqlite3
```

### PHP (alternativa)
```bash
# Com Slim Framework + ReactPHP
composer require slim/slim psr/http-message slim/psr7 reactphp/socket
```

## 🚀 Deploy

### PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start src/app.js --name "cloudfarm-api"
pm2 startup
pm2 save
```

### Firewall
```bash
# Permitir porta 8080
sudo ufw allow 8080
```

---

**📞 Próximos Passos:**
1. Implementar a API REST com os endpoints especificados
2. Configurar WebSocket para eventos em tempo real
3. Testar conectividade com o frontend
4. Sincronizar dados existentes do CloudFarm com a nova API

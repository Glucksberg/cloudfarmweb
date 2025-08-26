# 🌾 Integração CloudFarm - Mapa Web em Tempo Real

Este documento descreve a integração completa entre o sistema CloudFarm (VPS) e a interface web de mapeamento de talhões.

## 📋 Resumo da Integração

A integração permite:
- ✅ **Visualização em tempo real** dos talhões cadastrados no CloudFarm
- ✅ **Criação de novos talhões** via interface web com geometria desenhada
- ✅ **Atualização automática** quando dados mudam no CloudFarm
- ✅ **Sincronização bidirecional** entre web e sistema desktop
- ✅ **Dados completos** incluindo datas de plantio, variedades, grupos de maturação

## 🗂️ Dados Transmitidos

### Campos Principais (do CloudFarm para Web)
| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `nome` | Nome do talhão | "T1", "Retiro Norte" |
| `area_hectares` | Área em hectares | 145.5 |
| `cultura_atual` | Cultura plantada | "Soja", "Milho", "Algodão" |
| `variedade` | Variedade da cultura | "TMG 7262", "Pioneer 30F53" |
| `grupo_maturacao` | Grupo (soja) ou precocidade (milho) | "6.2", "Precoce" |
| `data_plantio` | Data de plantio | "2024-01-15" |
| `colheita_estimada` | Data estimada de colheita | "2024-05-15" |
| `geometry` | Coordenadas do polígono | GeoJSON Polygon |

## 🔧 Configuração do Frontend

### 1. Variáveis de Ambiente
Copie `.env.example` para `.env` e configure:

```env
# IP do seu VPS CloudFarm
REACT_APP_CLOUDFARM_API_URL=http://192.168.1.100:8080/api
REACT_APP_CLOUDFARM_WS_URL=ws://192.168.1.100:8080/ws
```

### 2. Arquivos Implementados

#### 🔗 `src/services/cloudFarmAPI.js`
- Classe principal para comunicação com CloudFarm
- Métodos REST: `getTalhoes()`, `createTalhao()`, `updateTalhao()`, `deleteTalhao()`
- WebSocket para atualizações em tempo real
- Reconexão automática em caso de falha

#### 🎣 `src/hooks/useCloudFarmTalhoes.js`
- Hook React customizado para gerenciar estado dos talhões
- Loading states, error handling, cache local
- Listeners para eventos WebSocket
- Estatísticas calculadas automaticamente

#### 🗺️ `src/pages/Talhoes.js` (atualizado)
- Interface integrada com CloudFarm
- Formulário expandido com todos os campos
- Indicadores de status de conexão
- Estatísticas em tempo real

## 🛠️ O que Você Precisa Implementar no VPS

### 📡 1. API REST (Porto 8080)

Crie os seguintes endpoints:

```bash
# Verificar saúde da API
GET http://SEU_VPS_IP:8080/api/health

# Listar todos os talhões
GET http://SEU_VPS_IP:8080/api/talhoes

# Criar novo talhão
POST http://SEU_VPS_IP:8080/api/talhoes

# Atualizar talhão existente  
PUT http://SEU_VPS_IP:8080/api/talhoes/{id}

# Deletar talhão
DELETE http://SEU_VPS_IP:8080/api/talhoes/{id}

# Obter estatísticas
GET http://SEU_VPS_IP:8080/api/estatisticas
```

### 🔄 2. WebSocket (Porto 8080/ws)

Para notificações em tempo real:

```javascript
// Eventos que o CloudFarm deve enviar:
{
  "type": "talhao_created",
  "data": { /* dados completos do novo talhão */ }
}

{
  "type": "talhao_updated", 
  "data": { /* dados atualizados do talhão */ }
}

{
  "type": "plantio_iniciado",
  "data": {
    "talhao_id": "t5",
    "cultura": "Soja",
    "data_plantio": "2024-01-20"
  }
}
```

### 📊 3. Formato de Dados

O CloudFarm deve retornar talhões neste formato:

```json
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
```

## 🚀 Exemplo de Implementação (Node.js)

### Instalação
```bash
mkdir cloudfarm-api
cd cloudfarm-api
npm init -y
npm install express cors ws sqlite3 dotenv
```

### Código Base
```javascript
// app.js
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Listar talhões (exemplo com dados do CloudFarm)
app.get('/api/talhoes', async (req, res) => {
  try {
    // Aqui você conectaria com sua base de dados CloudFarm
    const talhoes = await buscarTalhoesCloudFarm();
    res.json(talhoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo talhão
app.post('/api/talhoes', async (req, res) => {
  try {
    const novoTalhao = await criarTalhaoCloudFarm(req.body);
    
    // Notificar via WebSocket
    broadcastEvent('talhao_created', novoTalhao);
    
    res.status(201).json(novoTalhao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Servidor WebSocket
const server = app.listen(PORT, () => {
  console.log(`CloudFarm API rodando na porta ${PORT}`);
});

const wss = new WebSocket.Server({ server, path: '/ws' });

function broadcastEvent(type, data) {
  const message = JSON.stringify({ type, data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Conectar com CloudFarm e monitorar mudanças
monitorarMudancasCloudFarm();
```

## 🧪 Testes de Integração

### 1. Testar API
```bash
# Verificar se a API está rodando
curl http://SEU_VPS_IP:8080/api/health

# Listar talhões
curl http://SEU_VPS_IP:8080/api/talhoes
```

### 2. Testar WebSocket
```javascript
// No console do browser
const ws = new WebSocket('ws://SEU_VPS_IP:8080/ws');
ws.onmessage = (e) => console.log('Recebido:', JSON.parse(e.data));
```

### 3. Verificar no Frontend
1. Abra a página de Talhões
2. Verifique o status "🟢 CloudFarm Conectado"
3. Teste criação de novo talhão
4. Verifique se aparece automaticamente na lista

## 🔧 Troubleshooting

### Problemas Comuns

#### 🔴 "CloudFarm Desconectado"
- ✅ Verificar se IP e porta estão corretos no `.env`
- ✅ Confirmar que API está rodando no VPS
- ✅ Testar conectividade: `telnet SEU_VPS_IP 8080`
- ✅ Verificar firewall do VPS

#### 🔴 "Erro ao carregar talhões"
- ✅ Verificar formato dos dados retornados pela API
- ✅ Confirmar que endpoint `/api/talhoes` está funcionando
- ✅ Verificar logs do servidor para erros

#### 🔴 "WebSocket não conecta"
- ✅ Verificar se WebSocket server está configurado
- ✅ Confirmar endpoint `/ws` está ativo
- ✅ Testar com ferramenta online de WebSocket

#### 🔴 "Geometria não aparece no mapa"
- ✅ Verificar se `geometry` está no formato GeoJSON correto
- ✅ Confirmar coordenadas estão em [longitude, latitude]
- ✅ Verificar se polígono está fechado (primeiro = último ponto)

### Logs Úteis
```javascript
// Frontend - abrir console do browser (F12)
// Procurar por mensagens:
"✅ Talhões recebidos: 15"
"🟢 WebSocket conectado ao CloudFarm"
"📍 Talhão t1: geometria personalizada"

// Backend - logs do servidor
console.log('API chamada:', req.method, req.path);
console.log('Dados recebidos:', req.body);
console.log('WebSocket cliente conectado');
```

## 📈 Próximas Funcionalidades

### Versão 2.0 (Futuro)
- 🔒 **Autenticação**: Login seguro para acesso
- 📊 **Dashboard**: Gráficos de produtividade e estatísticas
- 📱 **Mobile**: App móvel para uso em campo
- 🛰️ **Imagens**: Integração com imagens de satélite
- 📋 **Relatórios**: Exportação de dados em PDF/Excel
- 🔔 **Alertas**: Notificações de plantio/colheita

### Versão 1.1 (Próxima)
- 🗑️ **Deletar via web**: Remover talhões pela interface
- ✏️ **Editar inline**: Edição rápida de dados
- 🔍 **Filtros**: Buscar por cultura, status, etc.
- 💾 **Backup automático**: Sincronização com nuvem

## 📞 Suporte

Para dúvidas sobre a integração:
1. Verificar logs do console (F12 no browser)
2. Testar endpoints manualmente com curl/Postman
3. Confirmar formato dos dados no `CLOUDFARM_BACKEND_SPEC.md`

---

**🎯 Objetivo:** Transformar o CloudFarm em uma plataforma web moderna e colaborativa, mantendo toda a funcionalidade existente e adicionando visualização geográfica em tempo real.

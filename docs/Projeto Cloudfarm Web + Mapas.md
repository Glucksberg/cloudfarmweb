Excelente! Vou explicar tudo que você precisa saber sobre esse sistema de mapeamento e como integrá-lo com seu sistema existente.

## 1. **Entendendo as 3 Marcas/Serviços**

### **Mapbox**
- **O que é**: Plataforma principal de mapas e geolocalização
- **Função**: Fornece a biblioteca JavaScript, APIs e os tiles (azulejos) do mapa base
- **Custo**: Tem plano gratuito limitado, depois cobra por uso

### **OpenStreetMap (OSM)**
- **O que é**: Base de dados geográfica colaborativa e gratuita (tipo Wikipedia dos mapas)
- **Função**: Fornece os dados geográficos base (ruas, cidades, pontos de referência)
- **Custo**: 100% gratuito e open source

### **Maxar**
- **O que é**: Empresa de satélites que fornece imagens de alta resolução
- **Função**: Provê as imagens de satélite que você vê como fundo do mapa
- **Custo**: Geralmente incluído no plano do Mapbox

**Resposta à sua pergunta**: O desenvolvedor integrou principalmente o **Mapbox**, que por sua vez já tem parcerias com OSM (para dados) e Maxar (para imagens). É uma integração única com Mapbox que traz os outros serviços automaticamente.

## 2. **Arquitetura de Integração Completa**

### **Estrutura do Sistema**

```
VPS (Servidor único)
├── Backend (Node.js - Porta 3000)
│   ├── Bot Telegram (já existente)
│   ├── API REST (nova)
│   ├── WebSocket Server (tempo real)
│   └── MongoDB (compartilhado)
│
├── Frontend React (Porta 80/443)
│   ├── Mapbox GL JS
│   ├── Sistema de autenticação JWT
│   └── WebSocket Client
│
└── Nginx (Proxy reverso)
    ├── Redireciona /api/* → Backend:3000
    └── Serve React build → /
```

## 3. **Plano de Integração Detalhado**

### **Fase 1: Preparação do Backend**

1. **API REST no seu sistema atual**:
   - Endpoints para buscar talhões: `GET /api/talhoes`
   - Endpoint para buscar detalhes: `GET /api/talhoes/:id`
   - Endpoint para histórico: `GET /api/talhoes/:id/operacoes`
   - Autenticação JWT compartilhada com o bot

2. **WebSocket para atualizações em tempo real**:
   - Quando alguém faz uma operação no Telegram
   - O backend emite evento via WebSocket
   - O mapa no React atualiza instantaneamente

3. **Estrutura MongoDB necessária**:
```javascript
// Coleção: talhoes
{
  _id: ObjectId,
  nome: "T2",
  fazenda_id: ObjectId,
  geometria: {
    type: "Polygon",
    coordinates: [[[lng, lat], [lng, lat], ...]]
  },
  area_hectares: 145,
  cultura_atual: {
    tipo: "Soja",
    variedade: "OLIMPO",
    grupo_maturacao: "8.8",
    data_plantio: Date,
    colheita_estimada: Date
  },
  criado_por: ObjectId,
  empresa_id: ObjectId
}

// Coleção: operacoes
{
  _id: ObjectId,
  talhao_id: ObjectId,
  tipo: "pulverização",
  data: Date,
  detalhes: {},
  usuario_id: ObjectId,
  origem: "telegram" // ou "web"
}
```

### **Fase 2: Configuração do Mapa**

1. **Mapbox Setup**:
   - Criar conta no Mapbox
   - Gerar Access Token
   - Escolher estilo de mapa (satellite-streets-v12 seria ideal)

2. **Funcionalidades do Mapa**:
   - Desenho de polígonos (talhões)
   - Edição de geometrias existentes
   - Cálculo automático de área
   - Popup com informações ao clicar
   - Layers diferentes para cada cultura

### **Fase 3: Fluxo de Dados**

```
Telegram Bot → MongoDB → API REST → React/Mapbox
     ↓                        ↓
WebSocket ←─────────────── WebSocket Client
```

### **Fase 4: Autenticação Unificada**

1. **Login no React**:
   - Usa mesma API de auth do Telegram bot
   - Armazena JWT no localStorage
   - Interceptor Axios para incluir token

2. **Permissões por nível**:
   - Super Admin: Vê todos os talhões
   - Master: Vê talhões da empresa
   - Gerente: Vê fazendas específicas
   - Funcionário: Apenas visualização

## 4. **Configuração no VPS**

### **Estrutura de Portas**:
```bash
# Backend (já existe)
localhost:3000 - API + Bot

# Frontend React
localhost:3001 - Desenvolvimento
localhost:80/443 - Produção via Nginx

# MongoDB
localhost:27017 - Database
```

### **Nginx Config**:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    # React App
    location / {
        root /var/www/react-map;
        try_files $uri /index.html;
    }
    
    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

## 5. **Sincronização de Dados**

### **Telegram → Mapa**:
1. Usuário registra operação no Telegram
2. Bot salva no MongoDB
3. Backend emite evento WebSocket
4. React recebe e atualiza mapa

### **Mapa → Telegram**:
1. Usuário desenha talhão no mapa
2. React envia para API
3. API salva no MongoDB
4. Bot pode notificar usuários relevantes

## 6. **Considerações Importantes**

### **Performance**:
- Implementar paginação para muitos talhões
- Cache de geometrias no frontend
- Índices geoespaciais no MongoDB: `2dsphere`

### **Custos**:
- Mapbox: ~$0 até 50k carregamentos/mês
- Alternativa gratuita: Leaflet + OpenStreetMap
- Para imagens de satélite gratuitas: Sentinel Hub

### **Segurança**:
- CORS configurado para aceitar apenas seu domínio
- Rate limiting na API
- Validação de geometrias antes de salvar

### **Backup**:
- MongoDB replica set ou backup diário
- Versionamento de geometrias importantes

## 7. **Próximos Passos Recomendados**

1. **Implementar API REST** no seu backend existente
2. **Testar integração** com alguns endpoints básicos
3. **Configurar WebSocket** para tempo real
4. **Desenvolver React** com Mapbox
5. **Deploy** no mesmo VPS com Nginx

Esse plano permite total integração entre seu sistema Telegram e o novo mapa web, compartilhando o mesmo banco de dados e sistema de autenticação. Tudo rodando no mesmo VPS facilita muito a comunicação entre os componentes.

Quer que eu detalhe alguma parte específica antes de começarmos a implementação?
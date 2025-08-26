// CloudFarm API Service
// Serviço para conectar com a API/WebSocket do CloudFarm VPS

class CloudFarmAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:8080/api';
    this.wsURL = process.env.REACT_APP_CLOUDFARM_WS_URL || 'ws://localhost:8080/ws';
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 segundo inicial
    this.listeners = new Map();
  }

  // ===== MÉTODOS HTTP/REST =====

  // Buscar todos os talhões
  async getTalhoes() {
    try {
      console.log('📡 Buscando talhões do CloudFarm...');
      const response = await fetch(`${this.baseURL}/talhoes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Talhões recebidos:', data.length);
      return this.transformTalhoesData(data);
    } catch (error) {
      console.error('❌ Erro ao buscar talhões:', error);
      throw error;
    }
  }

  // Criar novo talhão
  async createTalhao(talhaoData) {
    try {
      console.log('📡 Criando novo talhão no CloudFarm...', talhaoData);
      const response = await fetch(`${this.baseURL}/talhoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(this.transformToBackendFormat(talhaoData))
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Talhão criado:', data);
      return this.transformTalhaoData(data);
    } catch (error) {
      console.error('❌ Erro ao criar talhão:', error);
      throw error;
    }
  }

  // Atualizar talhão existente
  async updateTalhao(id, talhaoData) {
    try {
      console.log('📡 Atualizando talhão no CloudFarm...', id, talhaoData);
      const response = await fetch(`${this.baseURL}/talhoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(this.transformToBackendFormat(talhaoData))
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Talhão atualizado:', data);
      return this.transformTalhaoData(data);
    } catch (error) {
      console.error('❌ Erro ao atualizar talhão:', error);
      throw error;
    }
  }

  // Deletar talhão
  async deleteTalhao(id) {
    try {
      console.log('📡 Deletando talhão no CloudFarm...', id);
      const response = await fetch(`${this.baseURL}/talhoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Talhão deletado:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar talhão:', error);
      throw error;
    }
  }

  // ===== MÉTODOS WEBSOCKET =====

  // Conectar WebSocket para atualizações em tempo real
  connectWebSocket() {
    try {
      console.log('🔌 Conectando WebSocket do CloudFarm...');
      this.socket = new WebSocket(this.wsURL);

      this.socket.onopen = () => {
        console.log('✅ WebSocket conectado ao CloudFarm');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Solicitar estado inicial
        this.sendMessage({
          type: 'subscribe',
          topics: ['talhoes', 'plantios', 'colheitas']
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Mensagem WebSocket recebida:', message);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        this.socket = null;
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      this.attemptReconnect();
    }
  }

  // Tentar reconectar WebSocket
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${this.reconnectDelay}ms`);

    setTimeout(() => {
      this.connectWebSocket();
    }, this.reconnectDelay);

    // Aumentar delay exponencialmente
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 segundos
  }

  // Enviar mensagem via WebSocket
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket não conectado, não foi possível enviar mensagem');
    }
  }

  // Processar mensagens WebSocket
  handleWebSocketMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'talhao_created':
        this.notifyListeners('talhao_created', this.transformTalhaoData(data));
        break;
      case 'talhao_updated':
        this.notifyListeners('talhao_updated', this.transformTalhaoData(data));
        break;
      case 'talhao_deleted':
        this.notifyListeners('talhao_deleted', data.id);
        break;
      case 'plantio_iniciado':
        this.notifyListeners('plantio_iniciado', data);
        break;
      case 'colheita_concluida':
        this.notifyListeners('colheita_concluida', data);
        break;
      default:
        console.log('📨 Tipo de mensagem não tratado:', type);
    }
  }

  // Adicionar listener para eventos WebSocket
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remover listener
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notificar listeners
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Erro ao executar listener:', error);
        }
      });
    }
  }

  // Desconectar WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // ===== TRANSFORMAÇÃO DE DADOS =====

  // Transformar dados do backend para frontend
  transformTalhoesData(backendData) {
    return backendData.map(item => this.transformTalhaoData(item));
  }

  transformTalhaoData(backendItem) {
    return {
      id: backendItem.id || backendItem.talhao_id,
      nome: backendItem.nome || backendItem.name,
      area: parseFloat(backendItem.area_hectares || backendItem.area || 0),
      cultura: backendItem.cultura_atual || backendItem.cultura || 'Não definida',
      variedade: backendItem.variedade || 'Não definida',
      grupoMaturacao: backendItem.grupo_maturacao || backendItem.precocidade || null,
      status: this.determineStatus(backendItem),
      dataPlantio: backendItem.data_plantio ? new Date(backendItem.data_plantio) : null,
      colheitaEstimada: backendItem.colheita_estimada ? new Date(backendItem.colheita_estimada) : null,
      geometry: backendItem.geometry ? {
        type: 'Polygon',
        coordinates: backendItem.geometry.coordinates || backendItem.coordinates
      } : null,
      // Campos adicionais do CloudFarm
      fazenda: backendItem.fazenda || null,
      proprietario: backendItem.proprietario || null,
      observacoes: backendItem.observacoes || '',
      created_at: backendItem.created_at ? new Date(backendItem.created_at) : new Date(),
      updated_at: backendItem.updated_at ? new Date(backendItem.updated_at) : new Date()
    };
  }

  // Transformar dados do frontend para backend
  transformToBackendFormat(frontendItem) {
    return {
      nome: frontendItem.nome,
      area_hectares: frontendItem.area,
      cultura_atual: frontendItem.cultura,
      variedade: frontendItem.variedade,
      grupo_maturacao: frontendItem.grupoMaturacao,
      data_plantio: frontendItem.dataPlantio ? frontendItem.dataPlantio.toISOString() : null,
      colheita_estimada: frontendItem.colheitaEstimada ? frontendItem.colheitaEstimada.toISOString() : null,
      geometry: frontendItem.geometry ? {
        type: 'Polygon',
        coordinates: frontendItem.geometry.coordinates
      } : null,
      observacoes: frontendItem.observacoes || ''
    };
  }

  // Determinar status baseado nos dados
  determineStatus(backendItem) {
    const hoje = new Date();
    const dataPlantio = backendItem.data_plantio ? new Date(backendItem.data_plantio) : null;
    const colheitaEstimada = backendItem.colheita_estimada ? new Date(backendItem.colheita_estimada) : null;

    if (!dataPlantio) {
      return 'livre';
    }

    if (dataPlantio > hoje) {
      return 'planejado';
    }

    if (colheitaEstimada && hoje > colheitaEstimada) {
      return 'colheita';
    }

    return 'plantado';
  }

  // ===== MÉTODOS DE UTILIDADE =====

  // Verificar conectividade com o backend
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      return false;
    }
  }

  // Obter estatísticas
  async getEstatisticas() {
    try {
      const response = await fetch(`${this.baseURL}/estatisticas`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

// Instância singleton
const cloudFarmAPI = new CloudFarmAPI();

export default cloudFarmAPI;

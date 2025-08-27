// CloudFarm API Service
// Serviço para conectar com a API/WebSocket do CloudFarm VPS

import authService from './authService';

class CloudFarmAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:3001/api';
    this.wsURL = process.env.REACT_APP_CLOUDFARM_WS_URL || 'ws://localhost:3001/ws';
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 segundo inicial
    this.listeners = new Map();

    // Detectar se estamos usando HTTPS com certificado auto-assinado
    this.isHTTPS = this.baseURL.startsWith('https://');
    this.isSelfSigned = this.isHTTPS && this.baseURL.includes('178.156.157.146');

    if (this.isSelfSigned) {
      console.log('🔒 Detectado certificado auto-assinado. Configurando tratamento especial...');
    }
  }

  // ===== MÉTODOS HTTP/REST AUTENTICADOS =====

  // Método auxiliar para fazer requisições autenticadas
  async makeAuthenticatedRequest(url, options = {}) {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Se token expirou, tentar renovar
      if (response.status === 401) {
        console.log('🔄 Token expirado, tentando renovar...');
        try {
          await authService.refreshToken();
          const newToken = authService.getToken();
          
          // Tentar novamente com novo token
          headers.Authorization = `Bearer ${newToken}`;
          return fetch(url, { ...options, headers });
        } catch (refreshError) {
          console.error('❌ Erro ao renovar token:', refreshError);
          // Se falhar, fazer logout
          await authService.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Erro na requisição autenticada:', error);
      throw error;
    }
  }

  // Buscar todos os talhões
  async getTalhoes() {
    try {
      console.log('📡 Buscando talhões do CloudFarm...');
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/talhoes`, {
        method: 'GET'
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
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/talhoes`, {
        method: 'POST',
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
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/talhoes/${id}`, {
        method: 'PUT',
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
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/talhoes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Talhão deletado:', id);
      return { success: true, id };
    } catch (error) {
      console.error('❌ Erro ao deletar talhão:', error);
      throw error;
    }
  }

  // Obter estatísticas
  async getEstatisticas() {
    try {
      console.log('📡 Buscando estatísticas do CloudFarm...');
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/estatisticas`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Estatísticas recebidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // ===== MÉTODOS WEBSOCKET AUTENTICADOS =====

  // Conectar WebSocket para atualizações em tempo real
  connectWebSocket() {
    // Verificar se WebSocket está desabilitado
    if (process.env.REACT_APP_DISABLE_WEBSOCKET === 'true') {
      console.log('🚫 WebSocket desabilitado via configuração.');
      return;
    }

    // ✅ HTTPS configurado - WebSocket seguro habilitado
    console.log('🔒 Conectando WebSocket seguro (WSS)...');

    try {
      const token = authService.getToken();

      if (!token) {
        console.error('❌ Token não encontrado para WebSocket');
        return;
      }

      console.log('🔌 Conectando WebSocket do CloudFarm com autenticação...');
      this.socket = new WebSocket(`${this.wsURL}?token=${token}`);

      this.socket.onopen = () => {
        console.log('✅ WebSocket conectado ao CloudFarm com autenticação');
        this.reconnectAttempts = 0;
        
        // Inscrever em canais necessários
        this.subscribeToChannels();
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

      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket desconectado', event.code, event.reason);
        this.socket = null;
        
        // Se foi fechado por falta de autorização, fazer logout
        if (event.code === 1008 || event.code === 1011) {
          console.error('❌ WebSocket: Token inválido ou expirado');
          authService.logout();
          return;
        }
        
        // Tentar reconectar automaticamente
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      this.attemptReconnect();
    }
  }

  // Inscrever em canais necessários
  subscribeToChannels() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const user = authService.getUser();
    if (!user) return;

    // Canais básicos
    this.subscribe('public.notifications');
    this.subscribe('public.alerts');
    
    // Canal da fazenda específica se disponível
    if (user.farm_id) {
      this.subscribe(`farm.${user.farm_id}`);
      this.subscribe(`farm.${user.farm_id}.operations`);
    }

    // Canais baseados em hierarquia
    if (user.roles && user.roles.includes('admin')) {
      this.subscribe('admin.system');
    }
    
    if (user.roles && (user.roles.includes('admin') || user.roles.includes('manager'))) {
      this.subscribe('management.reports');
      this.subscribe('management.operations');
    }

    console.log('📡 Inscrito em canais WebSocket baseados na hierarquia do usuário');
  }

  // Inscrever em canal específico
  subscribe(channel) {
    this.sendMessage('subscribe', { channel });
  }

  // Desinscrever de canal
  unsubscribe(channel) {
    this.sendMessage('unsubscribe', { channel });
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
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  // Enviar mensagem via WebSocket
  sendMessage(type, data = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('⚠️ WebSocket não conectado, não foi possível enviar mensagem');
    }
  }

  // Processar mensagens WebSocket
  handleWebSocketMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'welcome':
        console.log('🎉 Bem-vindo ao WebSocket CloudFarm:', data);
        break;

      case 'pong':
        console.log('🏓 Pong recebido');
        break;

      case 'channel_message':
        console.log(`📢 Mensagem no canal ${data.channel}:`, data.data);
        this.notifyListeners(data.channel, data.data);
        break;

      case 'talhao_created':
        console.log('🆕 Talhão criado via WebSocket:', data);
        this.notifyListeners('talhao_created', data);
        break;

      case 'talhao_updated':
        console.log('📝 Talhão atualizado via WebSocket:', data);
        this.notifyListeners('talhao_updated', data);
        break;

      case 'talhao_deleted':
        console.log('🗑️ Talhão deletado via WebSocket:', data);
        this.notifyListeners('talhao_deleted', data);
        break;

      case 'plantio_iniciado':
        console.log('🌱 Plantio iniciado via WebSocket:', data);
        this.notifyListeners('plantio_iniciado', data);
        break;

      case 'colheita_concluida':
        console.log('🚜 Colheita concluída via WebSocket:', data);
        this.notifyListeners('colheita_concluida', data);
        break;

      case 'error':
        console.error('❌ Erro WebSocket:', message.message);
        break;

      default:
        console.log('���� Mensagem WebSocket não tratada:', message);
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

  // Notificar listeners de eventos
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
  }

  // ===== MÉTODOS DE TRANSFORMAÇÃO DE DADOS =====

  // Transformar dados de talhões do backend para frontend
  transformTalhoesData(data) {
    if (!Array.isArray(data)) {
      console.warn('⚠️ Dados de talhões não são um array:', data);
      return [];
    }

    return data.map(talhao => this.transformTalhaoData(talhao));
  }

  // Transformar dados de um talhão do backend para frontend
  transformTalhaoData(talhao) {
    if (!talhao) return null;

    return {
      id: talhao.id || talhao._id,
      nome: talhao.nome,
      area_hectares: talhao.area_hectares,
      cultura_atual: talhao.cultura_atual,
      variedade: talhao.variedade,
      grupo_maturacao: talhao.grupo_maturacao,
      data_plantio: talhao.data_plantio,
      colheita_estimada: talhao.colheita_estimada,
      geometry: talhao.geometry,
      observacoes: talhao.observacoes,
      created_at: talhao.created_at,
      updated_at: talhao.updated_at,
      // Campos calculados
      status: this.calculateTalhaoStatus(talhao)
    };
  }

  // Transformar dados do frontend para backend
  transformToBackendFormat(data) {
    return {
      nome: data.nome,
      area_hectares: parseFloat(data.area_hectares) || 0,
      cultura_atual: data.cultura_atual || '',
      variedade: data.variedade || '',
      grupo_maturacao: data.grupo_maturacao || '',
      data_plantio: data.data_plantio,
      colheita_estimada: data.colheita_estimada,
      geometry: data.geometry,
      observacoes: data.observacoes || ''
    };
  }

  // Calcular status do talhão baseado nas datas
  calculateTalhaoStatus(talhao) {
    const now = new Date();
    const plantio = talhao.data_plantio ? new Date(talhao.data_plantio) : null;
    const colheita = talhao.colheita_estimada ? new Date(talhao.colheita_estimada) : null;

    if (!plantio) {
      return 'livre';
    }

    if (plantio > now) {
      return 'planejado';
    }

    if (colheita && now >= colheita) {
      return 'colheita';
    }

    if (plantio <= now) {
      return 'plantado';
    }

    return 'livre';
  }

  // Verificar conectividade básica (sem autenticação)
  async checkBasicConnection() {
    // Usar URL base do servidor (raiz)
    let serverURL = this.baseURL;
    if (serverURL.includes('/api')) {
      serverURL = serverURL.replace('/api', '');
    }

    console.log('🔍 Testando conectividade básica com:', serverURL);
    console.log('🔒 HTTPS configurado - testando endpoint raiz que funciona');

    try {
      // Primeiro tentar com HEAD request simples
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(serverURL, {
        method: 'HEAD',
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      console.log('✅ Servidor respondeu:', response.status);
      return response.status < 500; // Considerar sucesso se não for erro de servidor

    } catch (error) {
      console.error('❌ Erro na conectividade:', error.message || error);

      // Log do erro para diagnóstico
      console.log('📊 Detalhes do erro de conectividade:', error.name, error.message);

      // Detectar erros de certificado auto-assinado
      if (this.isSelfSigned && (
        error.message.includes('certificate') ||
        error.message.includes('SSL') ||
        error.message.includes('TLS') ||
        error.message.includes('insecure') ||
        error.message.includes('ERR_CERT')
      )) {
        console.warn('🔒 Erro de certificado auto-assinado detectado. Usuário precisa aceitar certificado.');
        throw new Error('Certificado auto-assinado precisa ser aceito no navegador');
      }

      // Se falhou com CORS, tentar no-cors como fallback
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        try {
          console.log('🔄 Tentando fallback no-cors...');
          await fetch(serverURL, {
            method: 'GET',
            mode: 'no-cors'
          });
          console.log('⚠️ Servidor acessível mas com problema de CORS');
          return true; // Servidor existe mas tem problema de CORS
        } catch (noCorsError) {
          console.error('❌ Servidor completamente inacessível:', noCorsError.message);
          return false;
        }
      }

      if (error.name === 'AbortError') {
        console.log('💡 Timeout - servidor muito lento ou offline');
      }

      return false;
    }
  }

  // Verificar conectividade com a API (com autenticação)
  async checkConnection() {
    try {
      // Usar endpoint raiz que está funcionando
      const baseURL = this.baseURL.replace('/api', '');
      const response = await this.makeAuthenticatedRequest(baseURL, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conexão com CloudFarm API ativa:', data);
        return true;
      } else {
        console.warn('⚠️ CloudFarm API respondeu com erro:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ CloudFarm API não acessível:', error);
      return false;
    }
  }
}

// Instância singleton
const cloudFarmAPI = new CloudFarmAPI();

export default cloudFarmAPI;

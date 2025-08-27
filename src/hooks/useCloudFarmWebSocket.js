import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personalizado para gerenciar conexão WebSocket autenticada com CloudFarm
 * Baseado na documentação da API CloudFarm
 */
const useCloudFarmWebSocket = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [connectionStats, setConnectionStats] = useState({
    attempts: 0,
    lastConnected: null,
    lastDisconnected: null
  });

  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);
  const listeners = useRef(new Map());
  const subscribedChannels = useRef(new Set());

  // URL do WebSocket
  const wsURL = process.env.REACT_APP_CLOUDFARM_WS_URL || 'ws://localhost:3001/ws';

  /**
   * Conectar ao WebSocket com autenticação JWT
   */
  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      console.warn('⚠️ Não é possível conectar WebSocket: usuário não autenticado');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('📡 WebSocket já conectado');
      return;
    }

    try {
      console.log('🔌 Conectando WebSocket CloudFarm com autenticação...');
      
      // Conectar com token JWT na URL
      ws.current = new WebSocket(`${wsURL}?token=${token}`);

      ws.current.onopen = () => {
        console.log('✅ WebSocket CloudFarm conectado com sucesso');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;

        setConnectionStats(prev => ({
          ...prev,
          lastConnected: new Date(),
          attempts: prev.attempts + 1
        }));

        // Reinscrever em canais se houver
        subscribedChannels.current.forEach(channel => {
          subscribeToChannel(channel);
        });
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Mensagem WebSocket recebida:', message);
          
          handleMessage(message);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
        setError('Erro na conexão WebSocket');
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        setIsConnected(false);
        ws.current = null;

        setConnectionStats(prev => ({
          ...prev,
          lastDisconnected: new Date()
        }));

        // Verificar motivo da desconexão
        if (event.code === 1008 || event.code === 1011) {
          // Token inválido ou expirado
          console.error('❌ WebSocket: Token inválido ou expirado');
          setError('Token inválido. Faça login novamente.');
          logout(); // Fazer logout automático
          return;
        }

        // Tentar reconectar automaticamente
        attemptReconnect();
      };

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      setError(`Erro ao conectar: ${error.message}`);
      attemptReconnect();
    }
  }, [isAuthenticated, token, logout, wsURL]);

  /**
   * Tentar reconectar automaticamente
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      setError('Falha ao reconectar após múltiplas tentativas');
      return;
    }

    reconnectAttempts.current++;
    const delay = reconnectDelay.current;

    console.log(`🔄 Tentativa de reconexão ${reconnectAttempts.current}/${maxReconnectAttempts} em ${delay}ms`);

    setTimeout(() => {
      if (isAuthenticated && token) {
        connect();
      }
    }, delay);

    // Aumentar delay exponencialmente
    reconnectDelay.current = Math.min(delay * 2, 30000);
  }, [connect, isAuthenticated, token]);

  /**
   * Processar mensagens recebidas
   */
  const handleMessage = useCallback((message) => {
    const { type, data } = message;

    switch (type) {
      case 'welcome':
        console.log('🎉 Bem-vindo ao WebSocket CloudFarm:', data);
        
        // Inscrever automaticamente em canais baseados no usuário
        autoSubscribeChannels();
        break;

      case 'pong':
        console.log('🏓 Pong recebido');
        break;

      case 'channel_message':
        console.log(`📢 Mensagem no canal ${data.channel}:`, data.data);
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          channel: data.channel,
          data: data.data,
          timestamp: new Date()
        }]);
        
        // Notificar listeners específicos do canal
        notifyListeners(data.channel, data.data);
        break;

      case 'talhao_created':
      case 'talhao_updated':
      case 'talhao_deleted':
      case 'plantio_iniciado':
      case 'colheita_concluida':
        console.log(`📡 Evento CloudFarm: ${type}`, data);
        notifyListeners(type, data);
        break;

      case 'error':
        console.error('❌ Erro WebSocket:', message.message);
        setError(message.message);
        break;

      default:
        console.log('📨 Mensagem WebSocket não tratada:', message);
        notifyListeners('unknown', message);
    }
  }, []);

  /**
   * Inscrever automaticamente em canais baseados no usuário
   */
  const autoSubscribeChannels = useCallback(() => {
    if (!user) return;

    // Canais públicos básicos
    subscribeToChannel('public.notifications');
    subscribeToChannel('public.alerts');
    
    // Canal da fazenda específica
    if (user.farm_id) {
      subscribeToChannel(`farm.${user.farm_id}`);
      subscribeToChannel(`farm.${user.farm_id}.operations`);
    }

    // Canais baseados em hierarquia/roles
    if (user.roles) {
      if (user.roles.includes('admin') || user.roles.includes('super_admin')) {
        subscribeToChannel('admin.system');
      }
      
      if (user.roles.includes('admin') || user.roles.includes('manager')) {
        subscribeToChannel('management.reports');
        subscribeToChannel('management.operations');
      }
    }

    console.log('📡 Auto-inscrição em canais baseada na hierarquia do usuário');
  }, [user]);

  /**
   * Enviar mensagem via WebSocket
   */
  const sendMessage = useCallback((type, data = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = { type, ...data };
      ws.current.send(JSON.stringify(message));
      console.log('📤 Mensagem enviada:', message);
    } else {
      console.warn('⚠️ WebSocket não conectado, mensagem não enviada');
      setError('WebSocket não conectado');
    }
  }, []);

  /**
   * Inscrever em canal específico
   */
  const subscribeToChannel = useCallback((channel) => {
    subscribedChannels.current.add(channel);
    sendMessage('subscribe', { channel });
    console.log(`📡 Inscrito no canal: ${channel}`);
  }, [sendMessage]);

  /**
   * Desinscrever de canal
   */
  const unsubscribeFromChannel = useCallback((channel) => {
    subscribedChannels.current.delete(channel);
    sendMessage('unsubscribe', { channel });
    console.log(`📡 Desinscrito do canal: ${channel}`);
  }, [sendMessage]);

  /**
   * Enviar mensagem para canal específico
   */
  const sendChannelMessage = useCallback((channel, data) => {
    sendMessage('message', { channel, data });
  }, [sendMessage]);

  /**
   * Enviar ping para manter conexão viva
   */
  const sendPing = useCallback(() => {
    sendMessage('ping');
  }, [sendMessage]);

  /**
   * Adicionar listener para eventos específicos
   */
  const addListener = useCallback((event, callback) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, []);
    }
    listeners.current.get(event).push(callback);

    // Retornar função para remover listener
    return () => {
      const callbacks = listeners.current.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }, []);

  /**
   * Notificar listeners de eventos
   */
  const notifyListeners = useCallback((event, data) => {
    const callbacks = listeners.current.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Erro ao executar listener:', error);
        }
      });
    }
  }, []);

  /**
   * Desconectar WebSocket
   */
  const disconnect = useCallback(() => {
    if (ws.current) {
      console.log('🔌 Desconectando WebSocket...');
      ws.current.close(1000, 'Desconexão manual');
      ws.current = null;
      setIsConnected(false);
    }
  }, []);

  /**
   * Limpar mensagens
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Obter estatísticas da conexão
   */
  const getStats = useCallback(() => {
    return {
      ...connectionStats,
      isConnected,
      subscribedChannels: Array.from(subscribedChannels.current),
      messageCount: messages.length,
      hasError: !!error
    };
  }, [connectionStats, isConnected, messages.length, error]);

  // Conectar automaticamente quando autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Heartbeat para manter conexão viva
  useEffect(() => {
    if (!isConnected) return;

    const heartbeat = setInterval(() => {
      sendPing();
    }, 15000); // Ping a cada 15 segundos

    return () => clearInterval(heartbeat);
  }, [isConnected, sendPing]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
      listeners.current.clear();
      subscribedChannels.current.clear();
    };
  }, [disconnect]);

  return {
    // Estado
    isConnected,
    messages,
    error,
    stats: getStats(),

    // Ações
    connect,
    disconnect,
    sendMessage,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendChannelMessage,
    sendPing,
    addListener,
    clearMessages,

    // Utilitários
    getStats
  };
};

export default useCloudFarmWebSocket;

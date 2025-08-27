import React, { useState } from 'react';
import useCloudFarmWebSocket from '../hooks/useCloudFarmWebSocket';
import { useAuth } from '../contexts/AuthContext';
import './WebSocketStatus.css';

/**
 * Componente para monitorar e exibir status da conexão WebSocket
 */
const WebSocketStatus = ({ 
  showDetails = false, 
  showMessages = false,
  className = '' 
}) => {
  const { isAuthenticated, user } = useAuth();
  const {
    isConnected,
    messages,
    error,
    stats,
    connect,
    disconnect,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendChannelMessage,
    clearMessages
  } = useCloudFarmWebSocket();

  const [newChannel, setNewChannel] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('public.chat');

  if (!isAuthenticated) {
    return null;
  }

  const handleSubscribe = () => {
    if (newChannel.trim()) {
      subscribeToChannel(newChannel.trim());
      setNewChannel('');
    }
  };

  const handleUnsubscribe = (channel) => {
    unsubscribeFromChannel(channel);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChannel) {
      sendChannelMessage(selectedChannel, {
        message: newMessage.trim(),
        sender: user?.name || 'Usuário',
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`websocket-status ${className}`}>
      {/* Status Principal */}
      <div className="ws-status-header">
        <div className={`ws-status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="ws-status-icon">
            {isConnected ? '🟢' : '🔴'}
          </span>
          <span className="ws-status-text">
            WebSocket {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div className="ws-status-actions">
          {!isConnected && (
            <button 
              onClick={connect}
              className="ws-btn ws-btn-connect"
              title="Reconectar WebSocket"
            >
              🔄 Conectar
            </button>
          )}
          
          {isConnected && (
            <button 
              onClick={disconnect}
              className="ws-btn ws-btn-disconnect"
              title="Desconectar WebSocket"
            >
              ⏹️ Desconectar
            </button>
          )}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="ws-error">
          <span className="ws-error-icon">⚠️</span>
          <span className="ws-error-text">{error}</span>
        </div>
      )}

      {/* Detalhes da Conexão */}
      {showDetails && (
        <div className="ws-details">
          <div className="ws-details-grid">
            <div className="ws-detail-item">
              <span className="ws-detail-label">Tentativas:</span>
              <span className="ws-detail-value">{stats.attempts}</span>
            </div>
            
            <div className="ws-detail-item">
              <span className="ws-detail-label">Canais:</span>
              <span className="ws-detail-value">{stats.subscribedChannels?.length || 0}</span>
            </div>
            
            <div className="ws-detail-item">
              <span className="ws-detail-label">Mensagens:</span>
              <span className="ws-detail-value">{stats.messageCount}</span>
            </div>
            
            {stats.lastConnected && (
              <div className="ws-detail-item">
                <span className="ws-detail-label">Conectado:</span>
                <span className="ws-detail-value">
                  {formatTimestamp(stats.lastConnected)}
                </span>
              </div>
            )}
          </div>

          {/* Canais Inscritos */}
          {stats.subscribedChannels && stats.subscribedChannels.length > 0 && (
            <div className="ws-channels">
              <h4 className="ws-channels-title">Canais Inscritos:</h4>
              <div className="ws-channels-list">
                {stats.subscribedChannels.map(channel => (
                  <div key={channel} className="ws-channel-item">
                    <span className="ws-channel-name">{channel}</span>
                    <button
                      onClick={() => handleUnsubscribe(channel)}
                      className="ws-btn ws-btn-small ws-btn-remove"
                      title="Desinscrever"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar Canal */}
          {isConnected && (
            <div className="ws-subscribe">
              <h4 className="ws-subscribe-title">Inscrever em Canal:</h4>
              <div className="ws-subscribe-form">
                <input
                  type="text"
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  placeholder="Ex: public.notifications"
                  className="ws-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <button
                  onClick={handleSubscribe}
                  className="ws-btn ws-btn-subscribe"
                >
                  📡 Inscrever
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mensagens */}
      {showMessages && (
        <div className="ws-messages">
          <div className="ws-messages-header">
            <h4 className="ws-messages-title">Mensagens WebSocket</h4>
            <div className="ws-messages-actions">
              <button
                onClick={clearMessages}
                className="ws-btn ws-btn-small ws-btn-clear"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>

          <div className="ws-messages-list">
            {messages.length === 0 ? (
              <div className="ws-no-messages">
                Nenhuma mensagem recebida
              </div>
            ) : (
              messages.slice(-20).map(message => (
                <div key={message.id} className="ws-message">
                  <div className="ws-message-header">
                    <span className="ws-message-channel">#{message.channel}</span>
                    <span className="ws-message-time">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <div className="ws-message-content">
                    {JSON.stringify(message.data, null, 2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Enviar Mensagem */}
          {isConnected && (
            <div className="ws-send-message">
              <div className="ws-send-form">
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="ws-select"
                >
                  <option value="public.chat">public.chat</option>
                  <option value="public.notifications">public.notifications</option>
                  {stats.subscribedChannels?.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="ws-input ws-input-message"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                
                <button
                  onClick={handleSendMessage}
                  className="ws-btn ws-btn-send"
                  disabled={!newMessage.trim()}
                >
                  📤 Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;

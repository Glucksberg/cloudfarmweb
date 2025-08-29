import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useCloudFarmTalhoes from '../hooks/useCloudFarmTalhoes';

const ConnectionStatus = () => {
  const { isAuthenticated } = useAuth();
  const { connected, error, reconnect, checkBasicConnection } = useCloudFarmTalhoes();
  const [basicConnection, setBasicConnection] = useState(null);
  const [checking, setChecking] = useState(false);

  // Verificar conectividade básica quando não autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      const checkBasic = async () => {
        setChecking(true);
        try {
          const isBasicConnected = await checkBasicConnection();
          setBasicConnection(isBasicConnected);
        } catch (error) {
          // Não logar erros suprimidos ou AbortErrors
          if (!error.suppressed && error.name !== 'AbortError') {
            console.warn('Erro na verificação básica:', error);
          }
          setBasicConnection(false);
        } finally {
          setChecking(false);
        }
      };

      // Aguardar um pouco antes da primeira verificação
      const initialTimeout = setTimeout(checkBasic, 2000); // 2 segundos

      // Verificar periodicamente mas com menos frequência
      const interval = setInterval(checkBasic, 60000); // 1 minuto

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    } else {
      setBasicConnection(null);
      setChecking(false);
    }
  }, [isAuthenticated, checkBasicConnection]);

  const handleReconnect = async () => {
    if (checking) return; // Evitar múltiplas tentativas simultâneas

    try {
      if (isAuthenticated) {
        setChecking(true);
        await reconnect();
      } else {
        setChecking(true);
        const isBasicConnected = await checkBasicConnection();
        setBasicConnection(isBasicConnected);
      }
    } catch (error) {
      // Não logar erros suprimidos ou AbortErrors
      if (!error.suppressed && error.name !== 'AbortError') {
        console.warn('Erro na reconexão:', error);
      }
      if (!isAuthenticated) {
        setBasicConnection(false);
      }
    } finally {
      setChecking(false);
    }
  };

  // Determinar status e mensagem
  const getStatus = () => {
    if (checking) {
      return {
        status: 'checking',
        color: '#ffc107',
        icon: '⏳',
        message: 'Verificando conexão...'
      };
    }

    if (isAuthenticated) {
      if (connected) {
        return {
          status: 'connected',
          color: '#4caf50',
          icon: '🟢',
          message: 'CloudFarm Conectado'
        };
      } else {
        return {
          status: 'disconnected',
          color: '#ffc107',
          icon: '🟡',
          message: error || 'CloudFarm Desconectado'
        };
      }
    } else {
      if (basicConnection === true) {
        return {
          status: 'server-online',
          color: '#2196f3',
          icon: '🔵',
          message: 'Servidor Acessível - CORS precisa ser configurado no VPS'
        };
      } else if (basicConnection === false) {
        return {
          status: 'server-offline',
          color: '#f44336',
          icon: '🔴',
          message: 'Servidor Offline ou Firewall Bloqueando'
        };
      } else {
        return {
          status: 'unknown',
          color: '#9e9e9e',
          icon: '⚪',
          message: 'Verificando conectividade...'
        };
      }
    }
  };

  const statusInfo = getStatus();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
      padding: '0.5rem',
      backgroundColor: statusInfo.color === '#4caf50' ? '#e8f5e8' : 
                      statusInfo.color === '#f44336' ? '#ffebee' : '#fff3cd',
      border: `1px solid ${statusInfo.color}`,
      borderRadius: '4px'
    }}>
      <span style={{ fontWeight: 'bold' }}>
        {statusInfo.icon} {statusInfo.message}
      </span>
      
      {(statusInfo.status === 'disconnected' || statusInfo.status === 'server-offline') && (
        <button
          onClick={handleReconnect}
          disabled={checking}
          style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: statusInfo.color,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: checking ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem',
            opacity: checking ? 0.6 : 1
          }}
        >
          🔄 {checking ? 'Verificando...' : 'Reconectar'}
        </button>
      )}

      {error && isAuthenticated && (
        <span style={{
          color: '#d32f2f',
          fontSize: '0.9rem',
          marginLeft: '0.5rem'
        }}>
          {error}
        </span>
      )}

      {!isAuthenticated && basicConnection === true && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '4px',
          fontSize: '0.85rem',
          lineHeight: '1.4'
        }}>
          <strong>🔧 Próximo passo:</strong> Configure CORS no VPS backend para permitir conexões do fly.dev
          <br />
          <strong>📄 Guia:</strong> Veja o arquivo BACKEND_CORS_CONFIG.md criado
        </div>
      )}

      {!isAuthenticated && basicConnection === false && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          fontSize: '0.85rem',
          lineHeight: '1.4'
        }}>
          <strong>🚨 Possível causa:</strong> Backend offline ou firewall bloqueando
          <br />
          <strong>💡 Verificar:</strong> <code>pm2 list</code> e <code>sudo ufw allow 3001</code> no VPS
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;

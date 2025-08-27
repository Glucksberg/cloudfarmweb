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
          console.warn('Erro na verificação básica:', error);
          setBasicConnection(false);
        } finally {
          setChecking(false);
        }
      };

      // Verificar apenas uma vez inicialmente
      checkBasic();

      // Verificar periodicamente mas com menos frequência
      const interval = setInterval(checkBasic, 60000); // 1 minuto
      return () => clearInterval(interval);
    } else {
      setBasicConnection(null);
      setChecking(false);
    }
  }, [isAuthenticated, checkBasicConnection]);

  const handleReconnect = async () => {
    if (isAuthenticated) {
      await reconnect();
    } else {
      setChecking(true);
      const isBasicConnected = await checkBasicConnection();
      setBasicConnection(isBasicConnected);
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
          message: 'Servidor Online - Faça login para conectar'
        };
      } else if (basicConnection === false) {
        return {
          status: 'server-offline',
          color: '#f44336',
          icon: '🔴',
          message: 'Servidor CloudFarm Offline'
        };
      } else {
        return {
          status: 'unknown',
          color: '#9e9e9e',
          icon: '⚪',
          message: 'Status desconhecido'
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
    </div>
  );
};

export default ConnectionStatus;

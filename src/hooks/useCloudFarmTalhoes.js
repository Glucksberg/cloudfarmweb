// Hook para gerenciar talhões integrados com CloudFarm
import { useState, useEffect, useCallback, useRef } from 'react';
import cloudFarmAPI from '../services/cloudFarmAPI';
import { useAuth } from '../contexts/AuthContext';

export const useCloudFarmTalhoes = () => {
  // Contexto de autenticação
  const { isAuthenticated, user } = useAuth();

  // Estados
  const [talhoes, setTalhoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Controle de componente montado
  const isMounted = useRef(true);

  // ===== OPERAÇÕES DE DADOS =====

  // Carregar talhões do CloudFarm
  const loadTalhoes = useCallback(async () => {
    if (!isMounted.current || !isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando talhões do CloudFarm...');
      const data = await cloudFarmAPI.getTalhoes();

      if (isMounted.current) {
        setTalhoes(data);
        console.log('✅ Talhões carregados:', data.length);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar talhões:', err);
      if (isMounted.current) {
        if (err.message.includes('Token') || err.message.includes('autentica')) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError(`Erro ao carregar talhões: ${err.message}`);
        }
        // Em caso de erro, usar dados locais como fallback
        setTalhoes([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  // Criar novo talhão
  const createTalhao = useCallback(async (talhaoData) => {
    if (!isMounted.current) return null;
    
    try {
      setError(null);
      console.log('➕ Criando novo talhão...', talhaoData);
      
      const newTalhao = await cloudFarmAPI.createTalhao(talhaoData);
      
      if (isMounted.current) {
        setTalhoes(prev => [...prev, newTalhao]);
        console.log('✅ Talhão criado com sucesso:', newTalhao);
        return newTalhao;
      }
    } catch (err) {
      console.error('❌ Erro ao criar talhão:', err);
      if (isMounted.current) {
        setError(`Erro ao criar talhão: ${err.message}`);
      }
      throw err;
    }
  }, []);

  // Atualizar talhão existente
  const updateTalhao = useCallback(async (id, talhaoData) => {
    if (!isMounted.current) return null;
    
    try {
      setError(null);
      console.log('✏️ Atualizando talhão...', id, talhaoData);
      
      const updatedTalhao = await cloudFarmAPI.updateTalhao(id, talhaoData);
      
      if (isMounted.current) {
        setTalhoes(prev => prev.map(t => t.id === id ? updatedTalhao : t));
        console.log('✅ Talhão atualizado com sucesso:', updatedTalhao);
        return updatedTalhao;
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar talhão:', err);
      if (isMounted.current) {
        setError(`Erro ao atualizar talhão: ${err.message}`);
      }
      throw err;
    }
  }, []);

  // Deletar talhão
  const deleteTalhao = useCallback(async (id) => {
    if (!isMounted.current) return false;
    
    try {
      setError(null);
      console.log('🗑️ Deletando talhão...', id);
      
      await cloudFarmAPI.deleteTalhao(id);
      
      if (isMounted.current) {
        setTalhoes(prev => prev.filter(t => t.id !== id));
        console.log('✅ Talhão deletado com sucesso:', id);
        return true;
      }
    } catch (err) {
      console.error('❌ Erro ao deletar talhão:', err);
      if (isMounted.current) {
        setError(`Erro ao deletar talhão: ${err.message}`);
      }
      throw err;
    }
  }, []);

  // ===== OPERAÇÕES DE CONECTIVIDADE =====

  // Verificar conexão com CloudFarm (só se autenticado)
  const checkConnection = useCallback(async () => {
    if (!isMounted.current || !isAuthenticated) {
      if (isMounted.current && !isAuthenticated) {
        setConnected(false);
        setError(null); // Limpar erro quando não autenticado
      }
      return false;
    }

    try {
      const isConnected = await cloudFarmAPI.checkConnection();
      if (isMounted.current) {
        setConnected(isConnected);
        if (isConnected) {
          setError(null);
        }
      }
      return isConnected;
    } catch (err) {
      console.error('❌ Erro ao verificar conexão:', err);
      if (isMounted.current) {
        setConnected(false);
        if (err.message.includes('Token') || err.message.includes('autentica')) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError('Sem conexão com CloudFarm');
        }
      }
      return false;
    }
  }, [isAuthenticated]);

  // Carregar estatísticas
  const loadStatistics = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      const stats = await cloudFarmAPI.getEstatisticas();
      if (isMounted.current) {
        setStatistics(stats);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar estatísticas:', err);
      // Estatísticas são opcionais, não definir como erro crítico
    }
  }, []);

  // ===== LISTENERS WEBSOCKET =====

  // Configurar listeners WebSocket
  useEffect(() => {
    const handleTalhaoCreated = (talhao) => {
      if (isMounted.current) {
        console.log('🆕 Talhão criado via WebSocket:', talhao);
        setTalhoes(prev => {
          // Verificar se já existe para evitar duplicatas
          const exists = prev.some(t => t.id === talhao.id);
          if (exists) {
            return prev.map(t => t.id === talhao.id ? talhao : t);
          }
          return [...prev, talhao];
        });
      }
    };

    const handleTalhaoUpdated = (talhao) => {
      if (isMounted.current) {
        console.log('📝 Talhão atualizado via WebSocket:', talhao);
        setTalhoes(prev => prev.map(t => t.id === talhao.id ? talhao : t));
      }
    };

    const handleTalhaoDeleted = (talhaoId) => {
      if (isMounted.current) {
        console.log('🗑️ Talhão deletado via WebSocket:', talhaoId);
        setTalhoes(prev => prev.filter(t => t.id !== talhaoId));
      }
    };

    const handlePlantioIniciado = (data) => {
      if (isMounted.current) {
        console.log('🌱 Plantio iniciado via WebSocket:', data);
        // Atualizar talhão com informações de plantio
        setTalhoes(prev => prev.map(t => 
          t.id === data.talhao_id 
            ? { 
                ...t, 
                status: 'plantado',
                cultura: data.cultura,
                variedade: data.variedade,
                dataPlantio: new Date(data.data_plantio),
                colheitaEstimada: data.colheita_estimada ? new Date(data.colheita_estimada) : null
              }
            : t
        ));
      }
    };

    const handleColheitaConcluida = (data) => {
      if (isMounted.current) {
        console.log('🚜 Colheita concluída via WebSocket:', data);
        // Atualizar talhão para status livre
        setTalhoes(prev => prev.map(t => 
          t.id === data.talhao_id 
            ? { 
                ...t, 
                status: 'livre',
                cultura: 'Não definida',
                variedade: 'Não definida',
                dataPlantio: null,
                colheitaEstimada: null
              }
            : t
        ));
      }
    };

    // Adicionar listeners
    cloudFarmAPI.addListener('talhao_created', handleTalhaoCreated);
    cloudFarmAPI.addListener('talhao_updated', handleTalhaoUpdated);
    cloudFarmAPI.addListener('talhao_deleted', handleTalhaoDeleted);
    cloudFarmAPI.addListener('plantio_iniciado', handlePlantioIniciado);
    cloudFarmAPI.addListener('colheita_concluida', handleColheitaConcluida);

    // Cleanup
    return () => {
      cloudFarmAPI.removeListener('talhao_created', handleTalhaoCreated);
      cloudFarmAPI.removeListener('talhao_updated', handleTalhaoUpdated);
      cloudFarmAPI.removeListener('talhao_deleted', handleTalhaoDeleted);
      cloudFarmAPI.removeListener('plantio_iniciado', handlePlantioIniciado);
      cloudFarmAPI.removeListener('colheita_concluida', handleColheitaConcluida);
    };
  }, []);

  // ===== INICIALIZAÇÃO =====

  // Carregar dados iniciais e conectar WebSocket
  useEffect(() => {
    const initialize = async () => {
      // Verificar conexão
      const isConnected = await checkConnection();
      
      if (isConnected) {
        // Carregar dados
        await loadTalhoes();
        await loadStatistics();
        
        // Conectar WebSocket para atualizações em tempo real
        cloudFarmAPI.connectWebSocket();
      }
    };

    initialize();

    // Verificar conexão periodicamente
    const connectionInterval = setInterval(checkConnection, 30000); // 30 segundos

    // Cleanup
    return () => {
      clearInterval(connectionInterval);
      isMounted.current = false;
    };
  }, [checkConnection, loadTalhoes, loadStatistics]);

  // ===== UTILIDADES =====

  // Buscar talhão por ID
  const getTalhaoById = useCallback((id) => {
    return talhoes.find(t => t.id === id);
  }, [talhoes]);

  // Buscar talhões por status
  const getTalhoesByStatus = useCallback((status) => {
    return talhoes.filter(t => t.status === status);
  }, [talhoes]);

  // Buscar talhões por cultura
  const getTalhoesByCultura = useCallback((cultura) => {
    return talhoes.filter(t => t.cultura === cultura);
  }, [talhoes]);

  // Calcular área total
  const getAreaTotal = useCallback(() => {
    return talhoes.reduce((total, t) => total + (t.area || 0), 0);
  }, [talhoes]);

  // Calcular estatísticas locais
  const getLocalStatistics = useCallback(() => {
    const total = talhoes.length;
    const plantados = getTalhoesByStatus('plantado').length;
    const livres = getTalhoesByStatus('livre').length;
    const areaTotal = getAreaTotal();

    return {
      total,
      plantados,
      livres,
      areaTotal,
      culturas: [...new Set(talhoes.map(t => t.cultura).filter(c => c !== 'Não definida'))]
    };
  }, [talhoes, getTalhoesByStatus, getAreaTotal]);

  // Reconectar manualmente
  const reconnect = useCallback(async () => {
    setError(null);
    cloudFarmAPI.disconnect();
    await checkConnection();
    await loadTalhoes();
    cloudFarmAPI.connectWebSocket();
  }, [checkConnection, loadTalhoes]);

  // ===== RETURN =====

  return {
    // Dados
    talhoes,
    statistics: statistics || getLocalStatistics(),
    
    // Estados
    loading,
    error,
    connected,
    
    // Operações CRUD
    createTalhao,
    updateTalhao,
    deleteTalhao,
    loadTalhoes,
    
    // Utilidades
    getTalhaoById,
    getTalhoesByStatus,
    getTalhoesByCultura,
    getAreaTotal,
    
    // Conectividade
    checkConnection,
    reconnect,
    
    // Controle
    clearError: () => setError(null)
  };
};

export default useCloudFarmTalhoes;

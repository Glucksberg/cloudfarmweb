import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const MapTest = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapStatus, setMapStatus] = useState('Inicializando...');
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  useEffect(() => {
    // Prevent double initialization
    if (map.current) return;

    console.log('=== TESTE MAPBOX ===');

    // Create abort controller for cleanup
    abortController.current = new AbortController();

    // Token direto para teste
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';

    console.log('Token length:', mapboxgl.accessToken.length);
    console.log('Container:', mapContainer.current);
    console.log('mapboxgl supported:', mapboxgl.supported());

    // Check WebGL support
    if (!mapboxgl.supported()) {
      const errorMsg = 'Mapbox GL não é suportado neste navegador';
      console.error('❌', errorMsg);
      setError(errorMsg);
      setMapStatus('Erro: Navegador não suportado');
      return;
    }

    // Check container
    if (!mapContainer.current) {
      const errorMsg = 'Container do mapa não encontrado';
      console.error('❌', errorMsg);
      setError(errorMsg);
      setMapStatus('Erro: Container não encontrado');
      return;
    }

    let mapInstance = null;

    try {
      console.log('🔄 Criando instância do mapa...');
      setMapStatus('Criando mapa...');

      mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-47.15, -15.48],
        zoom: 10,
        attributionControl: false,
        // Add network options to handle connectivity issues
        maxParallelImageRequests: 16,
        collectResourceTiming: false
      });

      map.current = mapInstance;
      console.log('🗺️ Mapa criado:', mapInstance);
      setMapStatus('Mapa criado, aguardando carregamento...');

      // Set up event listeners with error handling
      mapInstance.on('load', () => {
        if (abortController.current?.signal.aborted) return;
        console.log('✅ MAPA CARREGADO COM SUCESSO!');
        console.log('✅ Versão do Mapbox:', mapboxgl.version);
        setMapStatus('✅ Mapa carregado com sucesso!');
        setError(null);
      });

      mapInstance.on('error', (e) => {
        if (abortController.current?.signal.aborted) return;
        console.error('❌ ERRO DO MAPBOX:', e);
        console.error('❌ Detalhes do erro:', e.error);

        const errorMessage = e.error?.message || 'Erro desconhecido do Mapbox';
        setError(errorMessage);
        setMapStatus(`Erro: ${errorMessage}`);
      });

      mapInstance.on('style.load', () => {
        if (abortController.current?.signal.aborted) return;
        console.log('🎨 Estilo carregado');
      });

      mapInstance.on('render', () => {
        if (abortController.current?.signal.aborted) return;
        console.log('🖼️ Primeira renderização');
      }, { once: true });

      // Handle network errors
      mapInstance.on('dataloading', (e) => {
        if (abortController.current?.signal.aborted) return;
        if (e.sourceDataType === 'metadata') {
          setMapStatus('Carregando dados do mapa...');
        }
      });

      mapInstance.on('data', (e) => {
        if (abortController.current?.signal.aborted) return;
        if (e.sourceDataType === 'metadata' && e.isSourceLoaded) {
          setMapStatus('Dados carregados, renderizando...');
        }
      });

    } catch (error) {
      console.error('❌ ERRO AO CRIAR MAPA:', error);
      console.error('❌ Stack:', error.stack);

      const errorMessage = error.message || 'Erro desconhecido ao criar mapa';
      setError(errorMessage);
      setMapStatus(`Erro: ${errorMessage}`);
    }

    // Cleanup function
    return () => {
      console.log('🧹 Iniciando limpeza do mapa...');

      // Signal abort to prevent further operations
      if (abortController.current) {
        abortController.current.abort();
      }

      // Safe map removal with timeout
      if (map.current) {
        try {
          // Remove all event listeners first
          map.current.off();

          // Use setTimeout to avoid blocking the cleanup
          setTimeout(() => {
            try {
              if (map.current && !map.current._removed) {
                console.log('🗑️ Removendo instância do mapa...');
                map.current.remove();
              }
            } catch (removeError) {
              console.warn('⚠️ Erro ao remover mapa (ignorado):', removeError.message);
            }
          }, 0);

          map.current = null;
        } catch (cleanupError) {
          console.warn('⚠️ Erro durante limpeza (ignorado):', cleanupError.message);
        }
      }
    };
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧪 Teste do Mapbox</h1>
      <p>Verificando se o Mapbox carrega corretamente...</p>
      
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '400px',
          backgroundColor: '#f0f0f0',
          border: '2px solid #ccc',
          borderRadius: '8px'
        }}
      />
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p>📝 Abra o Console do navegador (F12) para ver os logs</p>
        <p>Se aparecer um mapa, o Mapbox está funcionando!</p>
      </div>
    </div>
  );
};

export default MapTest;

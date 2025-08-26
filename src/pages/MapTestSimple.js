import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  blockMapboxTelemetry,
  getRestrictiveMapConfig,
  createSafeMapCleanup,
  createSafeEventHandlers
} from '../utils/mapboxConfig';

// Ensure telemetry is blocked
blockMapboxTelemetry();

const MapTestSimple = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [status, setStatus] = useState('Carregando...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent double initialization
    if (map.current) return;

    console.log('=== MAPA TESTE SIMPLES (ANTI-TELEMETRY) ===');

    // Create abort controller for cleanup
    const abortController = new AbortController();
    const cleanupRef = { aborted: false };

    // Verificações básicas
    console.log('1. Mapbox GL importado:', !!mapboxgl);
    console.log('2. Mapbox GL versão:', mapboxgl.version);
    console.log('3. WebGL suportado:', mapboxgl.supported());

    if (!mapboxgl.supported()) {
      setError('WebGL não suportado');
      return;
    }

    // Token
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';
    console.log('4. Token configurado:', !!mapboxgl.accessToken);

    // Container
    console.log('5. Container ref:', mapContainer.current);

    if (!mapContainer.current) {
      setError('Container não encontrado');
      return;
    }

    let mapInstance = null;

    try {
      setStatus('Criando mapa (modo restrito)...');

      // Ultra-restrictive map configuration
      mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        // Use simpler style to reduce network requests
        style: {
          version: 8,
          sources: {
            'simple-tiles': {
              type: 'raster',
              tiles: ['https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=' + mapboxgl.accessToken],
              tileSize: 256
            }
          },
          layers: [{
            id: 'simple-tiles',
            type: 'raster',
            source: 'simple-tiles'
          }]
        },
        center: [-74.5, 40],
        zoom: 9,
        // Disable all tracking and telemetry
        attributionControl: false,
        logoPosition: 'bottom-right',
        collectResourceTiming: false,
        trackResize: false,
        // Reduce network requests
        maxParallelImageRequests: 4,
        maxTileCacheSize: 50,
        transformRequest: (url, resourceType) => {
          // Block analytics requests
          if (url.includes('/events/') ||
              url.includes('telemetry') ||
              url.includes('analytics') ||
              url.includes('performance')) {
            console.log('🚫 Blocked request:', url);
            return { url: '', headers: {} };
          }
          return { url };
        }
      });

      map.current = mapInstance;
      console.log('6. Mapa criado com configuração restrita');

      // Add minimal event listeners with protection
      const onLoad = () => {
        if (cleanupRef.aborted || abortController.signal.aborted) return;
        console.log('✅ MAPA CARREGOU (MODO RESTRITO)!');
        setStatus('✅ Mapa carregado (modo restrito)!');
        setError(null);
      };

      const onError = (e) => {
        if (cleanupRef.aborted || abortController.signal.aborted) return;
        console.error('❌ Erro do mapa:', e);

        // Ignore network-related errors that we can't control
        const errorMsg = e.error?.message || 'Erro desconhecido';
        if (errorMsg.includes('Failed to fetch') ||
            errorMsg.includes('NetworkError') ||
            errorMsg.includes('fetch')) {
          console.warn('⚠️ Ignorando erro de rede:', errorMsg);
          return;
        }

        setError(`Erro do Mapbox: ${errorMsg}`);
      };

      mapInstance.on('load', onLoad);
      mapInstance.on('error', onError);

      // Disable any possible telemetry after creation
      setTimeout(() => {
        try {
          if (mapInstance && mapInstance._requestManager) {
            const originalTransformRequest = mapInstance._requestManager.transformRequest;
            mapInstance._requestManager.transformRequest = (url, resourceType) => {
              if (url.includes('/events/') || url.includes('telemetry')) {
                console.log('🚫 Post-creation block:', url);
                return { url: '', headers: {} };
              }
              return originalTransformRequest ? originalTransformRequest(url, resourceType) : { url };
            };
          }
        } catch (disableError) {
          console.warn('Could not disable post-creation telemetry:', disableError);
        }
      }, 100);

    } catch (err) {
      console.error('❌ Erro ao criar:', err);
      setError(`Erro ao criar: ${err.message}`);
    }

    return () => {
      console.log('🧹 Iniciando limpeza robusta...');
      cleanupRef.aborted = true;
      abortController.abort();

      if (map.current) {
        try {
          console.log('🔇 Removendo todos os listeners...');
          map.current.off();

          // Force stop any ongoing requests
          if (map.current._requestManager) {
            try {
              map.current._requestManager.abort();
            } catch (abortError) {
              console.warn('Could not abort request manager:', abortError);
            }
          }

          // Delayed removal to prevent AbortError
          const mapToRemove = map.current;
          map.current = null;

          setTimeout(() => {
            try {
              if (mapToRemove && !mapToRemove._removed && !cleanupRef.aborted) {
                console.log('🗑️ Removendo instância do mapa...');
                mapToRemove.remove();
                console.log('✅ Mapa removido com sucesso');
              }
            } catch (removeError) {
              console.warn('⚠️ Erro ao remover mapa (IGNORADO):', removeError.message);
            }
          }, 50);

        } catch (cleanupError) {
          console.warn('⚠️ Erro durante limpeza (IGNORADO):', cleanupError.message);
        }
      }
    };
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧪 Teste Simples Mapbox</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Status:</strong> {error ? `❌ ${error}` : status}
      </div>

      <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
        <strong>Debug Info:</strong>
        <ul>
          <li>Mapbox GL Version: {mapboxgl.version}</li>
          <li>WebGL Support: {mapboxgl.supported() ? '✅' : '❌'}</li>
          <li>Token Set: {mapboxgl.accessToken ? '✅' : '❌'}</li>
        </ul>
      </div>
      
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '400px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5'
        }}
      />
      
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
        Abra o Console (F12) para ver logs detalhados
      </div>
    </div>
  );
};

export default MapTestSimple;

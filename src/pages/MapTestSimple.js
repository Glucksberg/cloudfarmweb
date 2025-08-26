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

    console.log('=== MAPA TESTE SIMPLES (ANTI-TELEMETRY v2) ===');

    // Create abort controller for cleanup
    const abortController = new AbortController();

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

    try {
      setStatus('Criando mapa (anti-telemetry v2)...');

      // Use centralized restrictive config
      const mapConfig = getRestrictiveMapConfig(
        mapContainer.current,
        'mapbox://styles/mapbox/streets-v11',
        [-74.5, 40],
        9
      );

      const mapInstance = new mapboxgl.Map(mapConfig);
      map.current = mapInstance;
      console.log('6. Mapa criado com configuração centralizada');

      // Use safe event handlers
      const handlers = createSafeEventHandlers(abortController);

      mapInstance.on('load', handlers.onLoad(() => {
        console.log('✅ MAPA CARREGOU (ANTI-TELEMETRY v2)!');
        setStatus('✅ Mapa carregado (anti-telemetry v2)!');
        setError(null);
      }));

      mapInstance.on('error', handlers.onError((e) => {
        console.error('❌ Erro do mapa:', e);
        setError(`Erro do Mapbox: ${e.error?.message || 'Erro desconhecido'}`);
      }));

    } catch (err) {
      console.error('❌ Erro ao criar:', err);
      setError(`Erro ao criar: ${err.message}`);
    }

    // Use centralized cleanup
    return createSafeMapCleanup(map, abortController);
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

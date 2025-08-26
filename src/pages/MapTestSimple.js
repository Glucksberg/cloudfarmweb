import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Disable Mapbox telemetry and analytics completely
if (typeof window !== 'undefined') {
  // Block Mapbox telemetry
  window.mapboxgl = window.mapboxgl || {};

  // Override internal functions that send telemetry
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];

    // Block Mapbox analytics/telemetry requests
    if (typeof url === 'string' && (
      url.includes('events.mapbox.com') ||
      url.includes('/events/') ||
      url.includes('/turnstile') ||
      url.includes('/performance') ||
      url.includes('telemetry')
    )) {
      console.log('🚫 Blocking Mapbox telemetry request:', url);
      return Promise.reject(new Error('Telemetry blocked'));
    }

    return originalFetch.apply(this, args);
  };
}

const MapTestSimple = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [status, setStatus] = useState('Carregando...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent double initialization
    if (map.current) return;

    console.log('=== MAPA TESTE SIMPLES ===');

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

    let mapInstance = null;

    try {
      setStatus('Criando mapa...');

      mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 9,
        attributionControl: false,
        maxParallelImageRequests: 16,
        collectResourceTiming: false
      });

      map.current = mapInstance;

      mapInstance.on('load', () => {
        if (abortController.signal.aborted) return;
        console.log('✅ MAPA CARREGOU!');
        setStatus('✅ Mapa carregado com sucesso!');
      });

      mapInstance.on('error', (e) => {
        if (abortController.signal.aborted) return;
        console.error('❌ Erro do mapa:', e);
        setError(`Erro do Mapbox: ${e.error?.message || 'Erro desconhecido'}`);
      });

    } catch (err) {
      console.error('❌ Erro ao criar:', err);
      setError(`Erro ao criar: ${err.message}`);
    }

    return () => {
      console.log('🧹 Limpeza do mapa simples...');
      abortController.abort();

      if (map.current) {
        try {
          map.current.off();
          setTimeout(() => {
            try {
              if (map.current && !map.current._removed) {
                map.current.remove();
              }
            } catch (removeError) {
              console.warn('⚠️ Erro ao remover mapa simples (ignorado):', removeError.message);
            }
          }, 0);
          map.current = null;
        } catch (cleanupError) {
          console.warn('⚠️ Erro durante limpeza simples (ignorado):', cleanupError.message);
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

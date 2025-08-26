import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapTestSimple = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [status, setStatus] = useState('Carregando...');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('=== MAPA TESTE SIMPLES ===');
    
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
      setStatus('Criando mapa...');
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 9
      });

      map.current.on('load', () => {
        console.log('✅ MAPA CARREGOU!');
        setStatus('✅ Mapa carregado com sucesso!');
      });

      map.current.on('error', (e) => {
        console.error('❌ Erro do mapa:', e);
        setError(`Erro do Mapbox: ${e.error?.message || 'Erro desconhecido'}`);
      });

    } catch (err) {
      console.error('❌ Erro ao criar:', err);
      setError(`Erro ao criar: ${err.message}`);
    }

    return () => {
      if (map.current) map.current.remove();
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

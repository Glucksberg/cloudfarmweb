import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MapTest = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    console.log('=== TESTE MAPBOX ===');
    
    // Token direto para teste
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';
    
    console.log('Token length:', mapboxgl.accessToken.length);
    console.log('Container:', mapContainer.current);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-47.15, -15.48],
        zoom: 10
      });

      map.current.on('load', () => {
        console.log('✅ MAPA CARREGADO COM SUCESSO!');
      });

      map.current.on('error', (e) => {
        console.error('❌ ERRO DO MAPBOX:', e);
      });

    } catch (error) {
      console.error('❌ ERRO AO CRIAR MAPA:', error);
    }

    return () => {
      if (map.current) map.current.remove();
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

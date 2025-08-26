import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapTestBasic = () => {
  useEffect(() => {
    console.log('=== TESTE BÁSICO MAPBOX ===');

    // Create abort controller for cleanup
    const abortController = new AbortController();
    let mapInstance = null;

    // Verificar tudo primeiro
    console.log('1. Mapbox importado:', typeof mapboxgl);
    console.log('2. Versão:', mapboxgl.version);
    console.log('3. Suporte WebGL:', mapboxgl.supported());

    // Token
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';
    console.log('4. Token configurado:', !!mapboxgl.accessToken);

    // Pegar container por ID
    const container = document.getElementById('map-basic');
    console.log('5. Container encontrado:', !!container);

    if (!container) {
      console.error('❌ Container não encontrado');
      return;
    }

    if (!mapboxgl.supported()) {
      console.error('❌ WebGL não suportado');
      container.innerHTML = '<div style="padding: 2rem; color: red;">WebGL não suportado</div>';
      return;
    }

    try {
      mapInstance = new mapboxgl.Map({
        container: 'map-basic',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 9,
        attributionControl: false,
        maxParallelImageRequests: 16,
        collectResourceTiming: false
      });

      console.log('6. Mapa criado:', !!mapInstance);

      mapInstance.on('load', () => {
        if (abortController.signal.aborted) return;
        console.log('✅ MAPA CARREGOU PERFEITAMENTE!');
        const info = document.getElementById('status');
        if (info) info.textContent = '✅ Mapa carregado com sucesso!';
      });

      mapInstance.on('error', (e) => {
        if (abortController.signal.aborted) return;
        console.error('❌ Erro:', e);
        const info = document.getElementById('status');
        if (info) info.textContent = `❌ Erro: ${e.error?.message}`;
      });

    } catch (error) {
      console.error('❌ Exceção:', error);
      const info = document.getElementById('status');
      if (info) info.textContent = `❌ Exceção: ${error.message}`;
    }

    return () => {
      console.log('🧹 Limpeza do mapa básico...');
      abortController.abort();

      if (mapInstance) {
        try {
          mapInstance.off();
          setTimeout(() => {
            try {
              if (mapInstance && !mapInstance._removed) {
                mapInstance.remove();
              }
            } catch (removeError) {
              console.warn('⚠️ Erro ao remover mapa básico (ignorado):', removeError.message);
            }
          }, 0);
        } catch (cleanupError) {
          console.warn('⚠️ Erro durante limpeza básica (ignorado):', cleanupError.message);
        }
      }
    };
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔧 Teste Básico Mapbox</h1>
      
      <div id="status" style={{ 
        marginBottom: '1rem', 
        padding: '1rem', 
        backgroundColor: '#f0f0f0',
        borderRadius: '4px'
      }}>
        🔄 Carregando...
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Verificações:</strong>
        <ul>
          <li>Mapbox GL: {typeof window.mapboxgl !== 'undefined' ? '✅' : '❌'}</li>
          <li>WebGL: {(() => {
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
              return gl ? '✅' : '❌';
            } catch (e) {
              return '❌';
            }
          })()}</li>
          <li>CSS Importado: {document.querySelector('link[href*="mapbox-gl"]') ? '✅' : '❌'}</li>
        </ul>
      </div>
      
      <div
        id="map-basic"
        style={{
          width: '100%',
          height: '400px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}
      />
      
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
        <strong>Console:</strong> Abra o Console (F12) para ver logs detalhados
      </div>
    </div>
  );
};

export default MapTestBasic;

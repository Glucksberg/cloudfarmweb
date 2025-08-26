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

const MapTestFinal = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [status, setStatus] = useState('Inicializando...');
  const [error, setError] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [networkBlocks, setNetworkBlocks] = useState(0);

  // Monitor console errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('AbortError') || message.includes('Failed to fetch')) {
        setErrorCount(prev => prev + 1);
      }
      return originalConsoleError.apply(this, args);
    };

    // Monitor network blocks
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      const message = args.join(' ');
      if (message.includes('🚫 Blocked') || message.includes('telemetry')) {
        setNetworkBlocks(prev => prev + 1);
      }
      return originalConsoleLog.apply(this, args);
    };

    return () => {
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
    };
  }, []);

  useEffect(() => {
    if (map.current) return;

    console.log('=== TESTE FINAL ANTI-TELEMETRY ===');
    
    const abortController = new AbortController();
    
    // Verificações
    if (!mapboxgl.supported()) {
      setError('WebGL não suportado');
      return;
    }

    mapboxgl.accessToken = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';
    
    if (!mapContainer.current) {
      setError('Container não encontrado');
      return;
    }

    try {
      setStatus('🔄 Criando mapa com proteção total...');
      
      const mapConfig = getRestrictiveMapConfig(
        mapContainer.current,
        'mapbox://styles/mapbox/streets-v11',
        [-47.15, -15.48],
        10
      );
      
      const mapInstance = new mapboxgl.Map(mapConfig);
      map.current = mapInstance;

      const handlers = createSafeEventHandlers(abortController);
      
      mapInstance.on('load', handlers.onLoad(() => {
        console.log('✅ TESTE FINAL: Mapa carregado SEM ERROS!');
        setStatus('✅ Mapa carregado com proteção total!');
        setError(null);
      }));

      mapInstance.on('error', handlers.onError((e) => {
        console.error('❌ Erro crítico:', e);
        setError(`Erro crítico: ${e.error?.message}`);
      }));

      // Add navigation controls to test interaction
      mapInstance.addControl(new mapboxgl.NavigationControl());

    } catch (err) {
      console.error('❌ Erro na criação:', err);
      setError(`Erro na criação: ${err.message}`);
    }

    return createSafeMapCleanup(map, abortController);
  }, []);

  const forceReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧪 Teste Final - Anti-Telemetry System</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Status Card */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: error ? '#ffebee' : '#e8f5e8',
          border: `2px solid ${error ? '#f44336' : '#4caf50'}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>📊 Status</h3>
          <div style={{ color: error ? '#d32f2f' : '#2e7d32' }}>
            {error || status}
          </div>
        </div>

        {/* Error Monitor */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: errorCount > 0 ? '#fff3e0' : '#f3e5f5',
          border: `2px solid ${errorCount > 0 ? '#ff9800' : '#9c27b0'}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>🚨 Error Monitor</h3>
          <div>
            <strong>AbortError/Failed to fetch:</strong> {errorCount}
            <br />
            <small>Esperado: 0 após correções</small>
          </div>
        </div>

        {/* Network Monitor */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>🛡️ Protection Monitor</h3>
          <div>
            <strong>Requisições bloqueadas:</strong> {networkBlocks}
            <br />
            <small>Quanto mais, melhor!</small>
          </div>
        </div>

        {/* System Info */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f5f5f5',
          border: '2px solid #9e9e9e',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>🔧 System Info</h3>
          <div style={{ fontSize: '0.9rem' }}>
            WebGL: {mapboxgl.supported() ? '✅' : '❌'}
            <br />
            Mapbox: v{mapboxgl.version}
            <br />
            Token: {mapboxgl.accessToken ? '✅' : '❌'}
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: '#e8f4fd',
        borderRadius: '8px',
        border: '2px solid #1976d2'
      }}>
        <h3>🧪 Instruções de Teste:</h3>
        <ol>
          <li><strong>Abra o Console (F12)</strong> - veja os logs em tempo real</li>
          <li><strong>Carregue a página</strong> - contador de erros deve ficar em 0</li>
          <li><strong>Navigate between pages</strong> - teste o cleanup robusto</li>
          <li><strong>Force reload (Ctrl+F5)</strong> - multiple times</li>
          <li><strong>Check network blocks</strong> - Should be blocking telemetry</li>
        </ol>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '500px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          position: 'relative'
        }}
      >
        {/* Loading overlay */}
        {!map.current && !error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1000
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
            <div>Carregando com proteção anti-telemetry...</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={forceReload}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Force Reload Test
        </button>
      </div>

      {/* Success Indicator */}
      {errorCount === 0 && networkBlocks > 0 && !error && (
        <div style={{
          marginTop: '2rem',
          padding: '2rem',
          backgroundColor: '#e8f5e8',
          border: '3px solid #4caf50',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#2e7d32', margin: '0' }}>
            ✅ SUCCESS! Anti-Telemetry System Working!
          </h2>
          <p style={{ color: '#388e3c', marginTop: '1rem' }}>
            Zero AbortErrors • Zero Failed Fetch • {networkBlocks} Blocked Requests
          </p>
        </div>
      )}
    </div>
  );
};

export default MapTestFinal;

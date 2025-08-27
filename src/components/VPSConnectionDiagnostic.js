import React, { useState, useCallback } from 'react';

const VPSConnectionDiagnostic = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const vpsIP = '178.156.157.146';
  const port = '3001';
  const baseURL = `http://${vpsIP}:${port}`;
  const apiURL = `${baseURL}/api`;

  const runTest = useCallback(async (testName, testFunction) => {
    setResults(prev => ({ ...prev, [testName]: { status: 'testing', message: 'Testando...' } }));
    
    try {
      const result = await testFunction();
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'success', 
          message: result.message,
          details: result.details 
        } 
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'error', 
          message: error.message,
          details: error.details || error.stack
        } 
      }));
    }
  }, []);

  const tests = {
    'basic-connection': {
      name: '1. Conectividade Básica do Servidor',
      description: 'Testa se o servidor VPS está respondendo na porta 3001',
      test: async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(baseURL, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return {
            message: 'Servidor respondendo na porta 3001',
            details: `Response type: ${response.type}`
          };
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Timeout: Servidor não responde em 10s');
          }
          throw new Error(`Servidor inacessível: ${error.message}`);
        }
      }
    },

    'cors-preflight': {
      name: '2. CORS Preflight',
      description: 'Testa se o servidor aceita requisições OPTIONS (CORS)',
      test: async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch(baseURL, {
            method: 'OPTIONS',
            mode: 'cors',
            signal: controller.signal,
            headers: {
              'Origin': window.location.origin,
              'Access-Control-Request-Method': 'GET',
              'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
          });
          clearTimeout(timeoutId);
          
          const corsHeaders = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials')
          };

          if (response.ok) {
            return {
              message: `CORS configurado corretamente (${response.status})`,
              details: `Headers CORS: ${JSON.stringify(corsHeaders, null, 2)}`
            };
          } else {
            throw new Error(`CORS com erro: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Timeout: CORS não responde em 8s');
          }
          throw new Error(`CORS falhou: ${error.message}`);
        }
      }
    },

    'api-health': {
      name: '3. API Health Check',
      description: 'Testa se o endpoint /api/health está funcionando',
      test: async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch(`${apiURL}/health`, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            return {
              message: `API Health OK (${response.status})`,
              details: `Response: ${JSON.stringify(data, null, 2)}`
            };
          } else {
            const errorText = await response.text();
            throw new Error(`API Health falhou: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Timeout: API Health não responde em 8s');
          }
          throw new Error(`API Health erro: ${error.message}`);
        }
      }
    },

    'websocket-test': {
      name: '4. WebSocket Connection',
      description: 'Testa se o WebSocket está aceitando conexões',
      test: async () => {
        return new Promise((resolve, reject) => {
          const wsURL = `ws://${vpsIP}:${port}/ws`;
          const ws = new WebSocket(wsURL);
          let resolved = false;

          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              ws.close();
              reject(new Error('Timeout: WebSocket não conecta em 8s'));
            }
          }, 8000);

          ws.onopen = () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              ws.close();
              resolve({
                message: 'WebSocket conectou com sucesso',
                details: `WebSocket URL: ${wsURL}`
              });
            }
          };

          ws.onerror = (error) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              reject(new Error(`WebSocket erro: ${error.message || 'Connection failed'}`));
            }
          };

          ws.onclose = (event) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              if (event.code === 1000) {
                resolve({
                  message: 'WebSocket funcionando (closed cleanly)',
                  details: `Close code: ${event.code}, reason: ${event.reason}`
                });
              } else {
                reject(new Error(`WebSocket fechou com erro: ${event.code} - ${event.reason}`));
              }
            }
          };
        });
      }
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults({});

    for (const [testKey, testConfig] of Object.entries(tests)) {
      await runTest(testKey, testConfig.test);
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'testing': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'testing': return '#ffc107';
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ 
      margin: '1rem 0', 
      padding: '1rem', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
        🔧 Diagnóstico de Conexão VPS
      </h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Servidor VPS:</strong> {vpsIP}:{port}<br />
        <strong>API URL:</strong> {apiURL}<br />
        <strong>Frontend URL:</strong> {window.location.origin}
      </div>

      <button
        onClick={runAllTests}
        disabled={testing}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: testing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {testing ? '⏳ Testando...' : '🔍 Executar Todos os Testes'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Object.entries(tests).map(([testKey, testConfig]) => {
          const result = results[testKey];
          const status = result?.status || 'pending';
          
          return (
            <div
              key={testKey}
              style={{
                padding: '0.75rem',
                border: `1px solid ${getStatusColor(status)}`,
                borderRadius: '4px',
                backgroundColor: status === 'success' ? '#e8f5e8' : 
                                status === 'error' ? '#ffebee' : 
                                status === 'testing' ? '#fff3cd' : 'white'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.25rem'
              }}>
                <span style={{ fontSize: '1.2em' }}>
                  {getStatusIcon(status)}
                </span>
                <strong>{testConfig.name}</strong>
                <button
                  onClick={() => runTest(testKey, testConfig.test)}
                  disabled={testing}
                  style={{
                    marginLeft: 'auto',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: testing ? 'not-allowed' : 'pointer'
                  }}
                >
                  🔄 Testar
                </button>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                {testConfig.description}
              </div>

              {result && (
                <div>
                  <div style={{ 
                    color: status === 'error' ? '#d32f2f' : '#2e7d32',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    {result.message}
                  </div>
                  
                  {result.details && (
                    <details style={{ fontSize: '0.8rem', color: '#555' }}>
                      <summary style={{ cursor: 'pointer', marginBottom: '0.25rem' }}>
                        Detalhes técnicos
                      </summary>
                      <pre style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '0.5rem', 
                        borderRadius: '3px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {result.details}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem', 
        backgroundColor: '#e3f2fd', 
        border: '1px solid #2196f3', 
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <strong>💡 Como interpretar os resultados:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li><strong>Teste 1 falha:</strong> Backend offline ou firewall bloqueando</li>
          <li><strong>Teste 2 falha:</strong> CORS não configurado no backend</li>
          <li><strong>Teste 3 falha:</strong> Endpoint /api/health não existe</li>
          <li><strong>Teste 4 falha:</strong> WebSocket não configurado</li>
        </ul>
      </div>
    </div>
  );
};

export default VPSConnectionDiagnostic;

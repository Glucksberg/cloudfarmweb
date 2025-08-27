import React, { useState } from 'react';

const SimpleVPSChecker = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState([]);

  const vpsIP = '178.156.157.146';
  const port = '3001';

  const addResult = (test, status, message, details = '') => {
    setResults(prev => [...prev, { test, status, message, details, timestamp: new Date() }]);
  };

  const runSimpleTests = async () => {
    setChecking(true);
    setResults([]);

    // Test 1: Basic HTTP connectivity
    addResult('basic', 'testing', 'Testando conectividade HTTP básica...');
    try {
      const response = await fetch(`http://${vpsIP}:${port}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(10000)
      });
      addResult('basic', 'success', 'Servidor responde a requisições HTTP', `Response type: ${response.type}`);
    } catch (error) {
      if (error.name === 'TimeoutError') {
        addResult('basic', 'error', 'Timeout: Servidor não responde em 10s', 'Possível causa: Servidor offline ou firewall bloqueando');
      } else {
        addResult('basic', 'error', `Falha na conectividade: ${error.message}`, 'Servidor possivelmente offline');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Try different approach with longer timeout
    addResult('alt', 'testing', 'Tentativa alternativa com timeout maior...');
    try {
      const img = new Image();
      const imgPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve('success');
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = `http://${vpsIP}:${port}/favicon.ico?t=${Date.now()}`;
      });
      
      await Promise.race([
        imgPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);
      
      addResult('alt', 'success', 'Servidor acessível via imagem', 'Método alternativo funcionou');
    } catch (error) {
      addResult('alt', 'error', `Método alternativo falhou: ${error.message}`, 'Confirma que servidor está inacessível');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: WebSocket attempt
    addResult('ws', 'testing', 'Testando conexão WebSocket...');
    try {
      const ws = new WebSocket(`ws://${vpsIP}:${port}`);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket timeout'));
        }, 8000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve();
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error('WebSocket connection failed'));
        };
      });

      addResult('ws', 'success', 'WebSocket pode conectar', 'Servidor está rodando');
    } catch (error) {
      addResult('ws', 'error', `WebSocket falhou: ${error.message}`, 'Confirma problema de conectividade');
    }

    setChecking(false);
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
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{
      margin: '1rem 0',
      padding: '1.5rem',
      border: '2px solid #dc3545',
      borderRadius: '8px',
      backgroundColor: '#fff5f5'
    }}>
      <h3 style={{ color: '#dc3545', margin: '0 0 1rem 0' }}>
        🚨 Diagnóstico Simplificado - VPS Inacessível
      </h3>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Problema identificado:</strong> Servidor {vpsIP}:{port} completamente inacessível
        <br />
        <strong>Isso indica:</strong> Backend offline, firewall bloqueando, ou IP incorreto
      </div>

      <button
        onClick={runSimpleTests}
        disabled={checking}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: checking ? '#6c757d' : '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: checking ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}
      >
        {checking ? '⏳ Testando...' : '🔍 Executar Testes Simplificados'}
      </button>

      {results.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4>Resultados dos Testes:</h4>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: '0.5rem',
                margin: '0.5rem 0',
                border: `1px solid ${getStatusColor(result.status)}`,
                borderRadius: '4px',
                backgroundColor: result.status === 'error' ? '#ffebee' : 
                                result.status === 'success' ? '#e8f5e8' : '#fff3cd'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>
                {getStatusIcon(result.status)} {result.message}
              </div>
              {result.details && (
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  {result.details}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{
        padding: '1rem',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        marginTop: '1rem'
      }}>
        <h4 style={{ color: '#856404', margin: '0 0 0.5rem 0' }}>
          🔧 AÇÕES IMEDIATAS NECESSÁRIAS NO VPS:
        </h4>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <p><strong>1. Verificar se o backend está rodando:</strong></p>
          <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem', borderRadius: '3px' }}>
            pm2 list
          </code>
          <p style={{ margin: '0.5rem 0' }}>Se não estiver rodando:</p>
          <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem', borderRadius: '3px' }}>
            cd ~/CloudFarm && pm2 start src/index.js --name cloudfarm-api
          </code>

          <p style={{ marginTop: '1rem' }}><strong>2. Verificar se a porta está aberta:</strong></p>
          <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem', borderRadius: '3px' }}>
            netstat -tlnp | grep 3001
          </code>

          <p style={{ marginTop: '1rem' }}><strong>3. Verificar firewall:</strong></p>
          <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem', borderRadius: '3px' }}>
            sudo ufw allow 3001 && sudo ufw status
          </code>

          <p style={{ marginTop: '1rem' }}><strong>4. Testar localmente no VPS:</strong></p>
          <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem', borderRadius: '3px' }}>
            curl -i http://localhost:3001/api/health
          </code>

          <p style={{ marginTop: '1rem' }}><strong>5. Ver logs do backend:</strong></p>
          <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem', borderRadius: '3px' }}>
            pm2 logs cloudfarm-api
          </code>
        </div>
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        marginTop: '1rem'
      }}>
        <h4 style={{ color: '#1976d2', margin: '0 0 0.5rem 0' }}>
          💡 Próximos Passos:
        </h4>
        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Execute os comandos acima no seu VPS</li>
          <li>Se o backend não estiver rodando, inicie-o</li>
          <li>Se estiver rodando, verifique os logs para erros</li>
          <li>Após corrigir, teste novamente aqui</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleVPSChecker;

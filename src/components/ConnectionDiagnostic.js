import React, { useState } from 'react';

const ConnectionDiagnostic = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const baseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:3001/api';
      console.log(`🔍 Testando conectividade com: ${baseURL}`);

      // Tentar fazer uma requisição simples para health check
      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.text();
        setResult({
          success: true,
          message: `✅ Backend CloudFarm conectado!\nURL: ${baseURL}\nResposta: ${data}`,
          url: baseURL
        });
      } else {
        setResult({
          success: false,
          message: `⚠️ Backend respondeu com erro: ${response.status}\nURL: ${baseURL}`,
          url: baseURL
        });
      }
    } catch (error) {
      console.error('Erro no teste de conectividade:', error);
      
      const baseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:3001/api';
      
      setResult({
        success: false,
        message: `❌ Backend CloudFarm não está acessível\nURL: ${baseURL}\nErro: ${error.message}`,
        url: baseURL,
        help: `
🔧 SOLUÇÕES RÁPIDAS:

1️⃣ VERIFICAR BACKEND:
   • O script do backend CloudFarm parou de rodar?
   • Reinicie o servidor na porta 3001

2️⃣ TESTAR NO TERMINAL:
   curl ${baseURL}/health

3️⃣ VERIFICAR CONFIGURAÇÃO:
   • Arquivo .env existe e está correto?
   • REACT_APP_CLOUDFARM_API_URL=${baseURL}

4️⃣ REINICIAR SERVIÇOS:
   • Reinicie o backend CloudFarm
   • Recarregue esta página (F5)

💡 DICA: O erro mais comum é o backend ter parado de rodar
        `
      });
    } finally {
      setTesting(false);
    }
  };

  const testAlternativePorts = async () => {
    setTesting(true);
    const portsToTest = [3001, 8080, 3000, 5000];
    const results = [];

    for (const port of portsToTest) {
      try {
        const testURL = `http://localhost:${port}/api/health`;
        console.log(`🔍 Testando porta ${port}...`);
        
        const response = await fetch(testURL, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.text();
          results.push(`✅ Porta ${port}: FUNCIONANDO - ${data}`);
        } else {
          results.push(`⚠️ Porta ${port}: Erro ${response.status}`);
        }
      } catch (error) {
        results.push(`❌ Porta ${port}: Não acessível`);
      }
    }

    setResult({
      success: results.some(r => r.includes('FUNCIONANDO')),
      message: `🔍 Teste de portas:\n${results.join('\n')}`,
      help: results.some(r => r.includes('FUNCIONANDO')) 
        ? '💡 Encontrou uma porta funcionando! Atualize o .env com a porta correta.'
        : '❌ Nenhuma porta está respondendo. O backend CloudFarm não está rodando.'
    });

    setTesting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #dc3545',
      borderRadius: '8px',
      padding: '15px',
      zIndex: 1000,
      maxWidth: '450px',
      boxShadow: '0 4px 8px rgba(220,53,69,0.3)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>
        🚨 Backend CloudFarm Offline
      </h4>
      
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={testConnection}
          disabled={testing}
          style={{
            background: testing ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer',
            marginRight: '8px',
            fontSize: '12px'
          }}
        >
          {testing ? '🔄 Testando...' : '🧪 Testar Conexão'}
        </button>

        <button
          onClick={testAlternativePorts}
          disabled={testing}
          style={{
            background: testing ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {testing ? '🔄 Procurando...' : '🔍 Procurar Portas'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '10px',
          background: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <pre style={{ 
            margin: 0, 
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '10px'
          }}>
            {result.message}
          </pre>
          {result.help && (
            <pre style={{ 
              margin: '8px 0 0 0', 
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '9px',
              background: '#f8f9fa',
              padding: '6px',
              borderRadius: '3px'
            }}>
              {result.help}
            </pre>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '10px', 
        fontSize: '10px', 
        color: '#666',
        borderTop: '1px solid #eee',
        paddingTop: '8px'
      }}>
        <strong>🎯 Ação recomendada:</strong> Reinicie o backend CloudFarm
      </div>
    </div>
  );
};

export default ConnectionDiagnostic;

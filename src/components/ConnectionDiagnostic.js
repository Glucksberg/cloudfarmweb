import React, { useState } from 'react';
import authService from '../services/authService';

const ConnectionDiagnostic = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const baseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:3001/api';
      console.log(`🔍 Testando conectividade com: ${baseURL}`);

      // Tentar fazer uma requisição simples
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
          message: `✅ Conectado com sucesso!\nResposta: ${data}`,
          url: baseURL
        });
      } else {
        setResult({
          success: false,
          message: `⚠️ Servidor respondeu com erro: ${response.status}`,
          url: baseURL
        });
      }
    } catch (error) {
      console.error('Erro no teste de conectividade:', error);
      
      const baseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:3001/api';
      
      setResult({
        success: false,
        message: `❌ Não foi possível conectar\nErro: ${error.message}`,
        url: baseURL,
        help: `
SOLUÇÕES:

1️⃣ VERIFICAR BACKEND:
   • Confirme se o backend CloudFarm está rodando
   • Para desenvolvimento: porta 3001
   • Para VPS: porta 8080

2️⃣ TESTAR NO TERMINAL:
   curl ${baseURL}/health

3️⃣ VERIFICAR .ENV:
   • REACT_APP_CLOUDFARM_API_URL=${baseURL}

4️⃣ REINICIAR SERVIÇOS:
   • Reinicie o backend CloudFarm
   • Reinicie este frontend (Ctrl+C e npm start)
        `
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      zIndex: 1000,
      maxWidth: '400px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
        🔌 Diagnóstico de Conectividade
      </h4>
      
      <button
        onClick={testConnection}
        disabled={testing}
        style={{
          background: testing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {testing ? '🔄 Testando...' : '🧪 Testar Conexão'}
      </button>

      {result && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            URL: {result.url}
          </div>
          <pre style={{ 
            margin: 0, 
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '11px'
          }}>
            {result.message}
          </pre>
          {result.help && (
            <pre style={{ 
              margin: '10px 0 0 0', 
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '10px',
              background: '#f8f9fa',
              padding: '8px',
              borderRadius: '4px'
            }}>
              {result.help}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionDiagnostic;

import React, { useState } from 'react';

const DirectCertificateTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testHTTPSConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('🔒 Testando conexão HTTPS direta...');
      
      const response = await fetch('https://178.156.157.146/api/health', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: 'Conexão HTTPS funcionando!',
          data: data
        });
      } else {
        setResult({
          success: false,
          message: `Servidor respondeu com erro: ${response.status}`,
          error: response.statusText
        });
      }
    } catch (error) {
      console.error('Erro no teste HTTPS:', error);
      setResult({
        success: false,
        message: 'Falha na conexão HTTPS',
        error: error.message,
        needsCertificate: error.message.includes('certificate') || 
                          error.message.includes('SSL') ||
                          error.message.includes('TLS') ||
                          error.message.includes('insecure') ||
                          error.message.includes('Failed to fetch')
      });
    } finally {
      setTesting(false);
    }
  };

  const openCertificatePage = () => {
    window.open('https://178.156.157.146', '_blank');
  };

  return (
    <div style={{
      margin: '1rem 0',
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      border: '2px solid #007bff',
      borderRadius: '8px'
    }}>
      <h4 style={{ color: '#007bff', margin: '0 0 1rem 0' }}>
        🔒 Teste Direto HTTPS
      </h4>
      
      <p style={{ marginBottom: '1rem' }}>
        Teste a conexão HTTPS diretamente para verificar certificados auto-assinados:
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={testHTTPSConnection}
          disabled={testing}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: testing ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {testing ? '⏳ Testando...' : '🔍 Testar HTTPS'}
        </button>

        <button
          onClick={openCertificatePage}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔒 Abrir para Aceitar Certificado
        </button>
      </div>

      {result && (
        <div style={{
          padding: '1rem',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h5 style={{ 
            color: result.success ? '#155724' : '#721c24',
            margin: '0 0 0.5rem 0'
          }}>
            {result.success ? '✅' : '❌'} {result.message}
          </h5>
          
          {result.error && (
            <p style={{ 
              margin: '0 0 0.5rem 0', 
              color: '#721c24',
              fontSize: '0.9rem'
            }}>
              <strong>Erro:</strong> {result.error}
            </p>
          )}

          {result.data && (
            <pre style={{
              backgroundColor: '#e9ecef',
              padding: '0.5rem',
              borderRadius: '3px',
              fontSize: '0.8rem',
              margin: '0.5rem 0 0 0',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}

          {result.needsCertificate && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px'
            }}>
              <h6 style={{ color: '#856404', margin: '0 0 0.5rem 0' }}>
                🔒 Ação Necessária: Aceitar Certificado
              </h6>
              <ol style={{ margin: '0', paddingLeft: '1.5rem', color: '#856404' }}>
                <li>Clique em "🔒 Abrir para Aceitar Certificado" acima</li>
                <li>Na nova aba, clique em "Avançado"</li>
                <li>Clique em "Prosseguir para 178.156.157.146 (inseguro)"</li>
                <li>Feche a aba e teste novamente aqui</li>
              </ol>
            </div>
          )}
        </div>
      )}

      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        padding: '0.75rem',
        fontSize: '0.9rem'
      }}>
        <strong>💡 O que este teste faz:</strong>
        <br />
        Tenta conectar diretamente em <code>https://178.156.157.146/api/health</code> 
        para verificar se o certificado auto-assinado foi aceito pelo navegador.
      </div>
    </div>
  );
};

export default DirectCertificateTest;

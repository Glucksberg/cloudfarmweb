import React, { useState, useEffect } from 'react';

const HTTPSSuccessIndicator = () => {
  const [testResult, setTestResult] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Testar conexão automaticamente quando componente carrega
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const response = await fetch('https://178.156.157.146/', {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          data: data,
          message: 'HTTPS funcionando!'
        });
      } else {
        setTestResult({
          success: false,
          message: `Erro: ${response.status}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        needsCertificate: true
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      margin: '1rem 0',
      padding: '1rem',
      backgroundColor: testResult?.success ? '#d4edda' : '#fff3cd',
      border: `2px solid ${testResult?.success ? '#28a745' : '#ffc107'}`,
      borderRadius: '8px',
      position: 'relative'
    }}>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: '#6c757d'
        }}
      >
        ×
      </button>

      <h4 style={{ 
        color: testResult?.success ? '#155724' : '#856404',
        margin: '0 0 1rem 0' 
      }}>
        {testResult?.success ? '🎉 HTTPS Configurado com Sucesso!' : '🔒 Teste de Conexão HTTPS'}
      </h4>

      {testResult?.success ? (
        <div>
          <p style={{ color: '#155724', margin: '0 0 1rem 0' }}>
            ✅ Conexão HTTPS segura estabelecida com sucesso!
            <br />
            ✅ Certificado auto-assinado aceito pelo navegador
            <br />
            ✅ Backend respondendo corretamente
          </p>
          
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            <strong>Resposta do servidor:</strong>
            <pre style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.8rem',
              overflow: 'auto'
            }}>
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>

          <p style={{ 
            margin: '1rem 0 0 0', 
            fontSize: '0.9rem',
            color: '#28a745' 
          }}>
            🚀 Agora você pode usar todas as funcionalidades do CloudFarm!
          </p>
        </div>
      ) : (
        <div>
          <p style={{ color: '#856404', margin: '0 0 1rem 0' }}>
            {testResult?.needsCertificate ? 
              'Certificado auto-assinado precisa ser aceito.' :
              'Testando conexão HTTPS...'
            }
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={testConnection}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Testar Novamente
            </button>
            
            {testResult?.needsCertificate && (
              <button
                onClick={() => window.open('https://178.156.157.146', '_blank')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔒 Aceitar Certificado
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HTTPSSuccessIndicator;

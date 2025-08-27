import React, { useState, useEffect } from 'react';

const HTTPSSuccessIndicator = () => {
  const [testResult, setTestResult] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Testar conexão automaticamente quando componente carrega
    testConnection();
  }, []);

  const testConnection = async () => {
    console.log('🔄 Iniciando teste de conexão HTTPS...');

    // Mostrar estado de carregamento
    setTestResult({
      success: false,
      message: 'Testando...',
      loading: true
    });

    try {
      console.log('📡 Fazendo requisição para https://178.156.157.146/');

      const response = await fetch('https://178.156.157.146/', {
        method: 'GET',
        mode: 'cors'
      });

      console.log('📨 Resposta recebida:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);

        setTestResult({
          success: true,
          data: data,
          message: 'HTTPS funcionando!',
          loading: false
        });
      } else {
        console.warn('⚠️ Resposta com erro:', response.status);
        setTestResult({
          success: false,
          message: `Servidor respondeu com erro: ${response.status}`,
          loading: false
        });
      }
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      setTestResult({
        success: false,
        message: error.message,
        needsCertificate: error.message.includes('Failed to fetch') ||
                         error.message.includes('certificate') ||
                         error.message.includes('SSL'),
        loading: false
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
            {testResult?.loading ?
              '⏳ Testando conexão HTTPS...' :
              testResult?.needsCertificate ?
                'Certificado auto-assinado precisa ser aceito.' :
                'Conexão HTTPS pronta para teste.'
            }
          </p>

          {testResult && !testResult.success && !testResult.loading && (
            <div style={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              padding: '0.75rem',
              margin: '0 0 1rem 0'
            }}>
              <strong>❌ Resultado do teste:</strong>
              <br />
              {testResult.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={testConnection}
              disabled={testResult?.loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: testResult?.loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: testResult?.loading ? 'not-allowed' : 'pointer'
              }}
            >
              {testResult?.loading ? '⏳ Testando...' : '🔄 Testar Novamente'}
            </button>

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
              🔒 Abrir Servidor
            </button>
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            <strong>💡 Instruções:</strong>
            <br />
            1. Clique em "🔒 Abrir Servidor" para aceitar o certificado
            <br />
            2. Na nova aba: Avançado → Prosseguir para 178.156.157.146
            <br />
            3. Volte aqui e clique "🔄 Testar Novamente"
            <br />
            4. Deve aparecer mensagem de sucesso verde
          </div>
        </div>
      )}
    </div>
  );
};

export default HTTPSSuccessIndicator;

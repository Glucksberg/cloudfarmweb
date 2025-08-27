import React, { useState, useEffect } from 'react';

const CertificateAcceptance = ({ apiURL }) => {
  const [certificateStatus, setCertificateStatus] = useState('checking');
  const [showAcceptance, setShowAcceptance] = useState(false);

  const testCertificate = async () => {
    try {
      // Extrair base URL
      const baseURL = apiURL.replace('/api', '');
      
      const response = await fetch(baseURL, {
        method: 'HEAD',
        mode: 'cors'
      });
      
      setCertificateStatus('accepted');
      setShowAcceptance(false);
    } catch (error) {
      if (error.message.includes('certificate') || 
          error.message.includes('SSL') ||
          error.message.includes('TLS') ||
          error.message.includes('insecure') ||
          error.message.includes('CERT')) {
        setCertificateStatus('needs-acceptance');
        setShowAcceptance(true);
      } else {
        setCertificateStatus('unknown-error');
        setShowAcceptance(false);
      }
    }
  };

  useEffect(() => {
    if (apiURL.startsWith('https://') && apiURL.includes('178.156.157.146')) {
      testCertificate();
    }
  }, [apiURL]);

  const handleAcceptCertificate = () => {
    const baseURL = apiURL.replace('/api', '');
    window.open(baseURL, '_blank');
  };

  if (!showAcceptance) {
    return null;
  }

  return (
    <div style={{
      margin: '1rem 0',
      padding: '1.5rem',
      backgroundColor: '#fff3cd',
      border: '2px solid #ffc107',
      borderRadius: '8px'
    }}>
      <h4 style={{ color: '#856404', margin: '0 0 1rem 0' }}>
        🔒 Certificado Auto-Assinado Detectado
      </h4>
      
      <p style={{ marginBottom: '1rem', color: '#856404' }}>
        Seu backend usa um certificado auto-assinado. Para funcionar corretamente, 
        você precisa aceitar o certificado no navegador.
      </p>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        border: '1px solid #dee2e6'
      }}>
        <h5 style={{ margin: '0 0 0.5rem 0' }}>Como aceitar o certificado:</h5>
        <ol style={{ margin: '0', paddingLeft: '1.5rem' }}>
          <li>Clique no botão "Aceitar Certificado" abaixo</li>
          <li>Uma nova aba abrirá com aviso de segurança</li>
          <li>Clique em "Avançado" ou "Advanced"</li>
          <li>Clique em "Prosseguir para 178.156.157.146 (inseguro)"</li>
          <li>Feche a aba e recarregue esta página</li>
        </ol>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={handleAcceptCertificate}
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
          🔒 Aceitar Certificado
        </button>
        
        <button
          onClick={testCertificate}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Testar Novamente
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
        <strong>💡 Para produção:</strong> Configure um domínio próprio (ex: api.seusite.com) 
        para usar Let's Encrypt e ter certificados válidos automaticamente.
      </div>
    </div>
  );
};

export default CertificateAcceptance;

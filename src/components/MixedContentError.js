import React from 'react';

const MixedContentError = () => {
  const handleLocalSetup = () => {
    window.open('https://github.com/your-repo/backend-setup', '_blank');
  };

  const handleSSLSetup = () => {
    const element = document.createElement('a');
    element.href = `${window.location.origin}/VPS_SSL_SETUP.md`;
    element.download = 'VPS_SSL_SETUP.md';
    element.click();
  };

  return (
    <div style={{
      margin: '2rem 0',
      padding: '2rem',
      border: '3px solid #dc3545',
      borderRadius: '12px',
      backgroundColor: '#fff5f5',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
        🚫 Mixed Content Security Block
      </h2>
      
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <strong>Problema Identificado:</strong>
        <br />
        Página HTTPS não pode acessar backend HTTP inseguro
        <br />
        <small>Navegadores modernos bloqueiam Mixed Content por segurança</small>
      </div>

      <h3 style={{ color: '#495057', marginBottom: '1rem' }}>
        🔧 Escolha uma Solução:
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Solução 1: Local */}
        <div style={{
          padding: '1.5rem',
          border: '2px solid #28a745',
          borderRadius: '8px',
          backgroundColor: '#f8fff9'
        }}>
          <h4 style={{ color: '#28a745', marginBottom: '1rem' }}>
            ✅ Solução 1: Desenvolvimento Local
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            Execute o backend localmente no seu computador
          </p>
          <div style={{ backgroundColor: '#e9ecef', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <code>git clone [repo]</code><br />
            <code>cd backend && npm install</code><br />
            <code>npm start</code>
          </div>
          <button
            onClick={handleLocalSetup}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            �� Ver Instruções
          </button>
        </div>

        {/* Solução 2: SSL */}
        <div style={{
          padding: '1.5rem',
          border: '2px solid #007bff',
          borderRadius: '8px',
          backgroundColor: '#f8f9ff'
        }}>
          <h4 style={{ color: '#007bff', marginBottom: '1rem' }}>
            🔒 Solução 2: SSL no VPS
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            Configure HTTPS no seu VPS (Nginx + Let's Encrypt)
          </p>
          <div style={{ backgroundColor: '#e9ecef', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <code>sudo apt install nginx certbot</code><br />
            <code>sudo certbot --nginx</code><br />
            <code>https://178.156.157.146</code>
          </div>
          <button
            onClick={handleSSLSetup}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📖 Baixar Guia SSL
          </button>
        </div>

        {/* Solução 3: Tunnel */}
        <div style={{
          padding: '1.5rem',
          border: '2px solid #6f42c1',
          borderRadius: '8px',
          backgroundColor: '#f8f7ff'
        }}>
          <h4 style={{ color: '#6f42c1', marginBottom: '1rem' }}>
            🌐 Solução 3: Tunnel/Proxy
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            Use Ngrok, Cloudflare Tunnel ou similar
          </p>
          <div style={{ backgroundColor: '#e9ecef', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <code>npm install -g ngrok</code><br />
            <code>ngrok http 3001</code><br />
            <code>https://abc123.ngrok.io</code>
          </div>
          <button
            onClick={() => window.open('https://ngrok.com/', '_blank')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🌐 Abrir Ngrok
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <h4 style={{ color: '#1976d2', marginTop: 0 }}>
          💡 Recomendação:
        </h4>
        <p style={{ margin: 0 }}>
          Para desenvolvimento rápido, use a <strong>Solução 1</strong> (local).
          <br />
          Para produção, use a <strong>Solução 2</strong> (SSL no VPS).
        </p>
      </div>
    </div>
  );
};

export default MixedContentError;

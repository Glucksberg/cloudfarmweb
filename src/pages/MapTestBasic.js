import React from 'react';

const MapTestBasic = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🧪 MapTestBasic - DEPRECATED</h1>
      <div style={{
        padding: '2rem',
        backgroundColor: '#fff3e0',
        border: '2px solid #ff9800',
        borderRadius: '8px',
        margin: '2rem 0'
      }}>
        <h3>⚠️ Esta página de teste foi desabilitada</h3>
        <p><strong>Motivo:</strong> Conflitos com sistema anti-telemetria</p>
        <p><strong>Use instead:</strong> Página "Talhões" (funcionando perfeitamente)</p>
      </div>
      
      <div style={{
        padding: '1rem',
        backgroundColor: '#e8f5e8',
        border: '2px solid #4caf50',
        borderRadius: '8px'
      }}>
        <h4>✅ Página Funcionando:</h4>
        <p><strong>"Talhões"</strong> - Mapa satélite + labels + talhões funcionando sem erros</p>
      </div>
    </div>
  );
};

export default MapTestBasic;

import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🌾 CloudFarm Web</h1>
          <p>Gestão inteligente para o campo</p>
        </div>
      </header>
      <main className="main-content">
        <div className="welcome-container">
          <h2>Bem-vindo ao CloudFarm</h2>
          <p>Sistema de gestão agrícola em desenvolvimento...</p>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>📊 Dashboard</h3>
              <p>Visão geral da fazenda</p>
            </div>
            <div className="feature-card">
              <h3>🗺️ Talhões</h3>
              <p>Mapeamento interativo</p>
            </div>
            <div className="feature-card">
              <h3>📦 Estoque</h3>
              <p>Controle de insumos</p>
            </div>
            <div className="feature-card">
              <h3>👥 Equipe</h3>
              <p>Gestão de funcionários</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

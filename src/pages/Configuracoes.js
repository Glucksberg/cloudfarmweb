import React, { useState } from 'react';
import './Pages.css';

const Configuracoes = () => {
  const [selectedFarm, setSelectedFarm] = useState('fazenda1');
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [emailReports, setEmailReports] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const farms = [
    { id: 'fazenda1', name: 'Fazenda São João', area: '1.240 ha', location: 'Brasília - DF' },
    { id: 'fazenda2', name: 'Fazenda Santa Maria', area: '890 ha', location: 'Goiânia - GO' },
    { id: 'fazenda3', name: 'Fazenda Boa Vista', area: '2.100 ha', location: 'Barreiras - BA' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ Configurações</h1>
        <p>Configurações do sistema e preferências</p>
      </div>

      <div className="config-sections">
        
        {/* Farm Selection */}
        <div className="config-section">
          <h3>🏡 Seleção de Fazenda</h3>
          <p className="section-desc">Escolha a fazenda que deseja gerenciar</p>
          
          <div className="farms-grid">
            {farms.map((farm) => (
              <div 
                key={farm.id} 
                className={`farm-card ${selectedFarm === farm.id ? 'selected' : ''}`}
                onClick={() => setSelectedFarm(farm.id)}
              >
                <div className="farm-header">
                  <span className="farm-icon">🏡</span>
                  <div className="farm-check">
                    {selectedFarm === farm.id && <span>✓</span>}
                  </div>
                </div>
                <h4 className="farm-name">{farm.name}</h4>
                <div className="farm-info">
                  <span className="farm-area">{farm.area}</span>
                  <span className="farm-location">{farm.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="config-section">
          <h3>🔔 Notificações</h3>
          <p className="section-desc">Configure como você deseja receber notificações</p>
          
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Notificações em tempo real</span>
                <span className="setting-desc">Receba atualizações instantâneas das atividades</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Sons de alerta</span>
                <span className="setting-desc">Reproduzir sons para alertas importantes</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Relatórios por email</span>
                <span className="setting-desc">Receber relatórios diários por email</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={emailReports}
                  onChange={(e) => setEmailReports(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="config-section">
          <h3>🎨 Aparência</h3>
          <p className="section-desc">Personalize a aparência do sistema</p>
          
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Modo escuro</span>
                <span className="setting-desc">Interface com cores escuras</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="config-section">
          <h3>👤 Conta</h3>
          <p className="section-desc">Configurações da sua conta</p>
          
          <div className="account-actions">
            <button className="action-button primary">
              <span className="button-icon">✏️</span>
              Editar Perfil
            </button>
            <button className="action-button secondary">
              <span className="button-icon">🔒</span>
              Alterar Senha
            </button>
            <button className="action-button secondary">
              <span className="button-icon">📧</span>
              Alterar Email
            </button>
          </div>
        </div>

        {/* System */}
        <div className="config-section">
          <h3>🔧 Sistema</h3>
          <p className="section-desc">Informações e configurações do sistema</p>
          
          <div className="system-info">
            <div className="info-item">
              <span className="info-label">Versão:</span>
              <span className="info-value">CloudFarm Web v1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Última atualização:</span>
              <span className="info-value">25/08/2025</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status do servidor:</span>
              <span className="info-value status-online">🟢 Online</span>
            </div>
          </div>

          <div className="system-actions">
            <button className="action-button secondary">
              <span className="button-icon">📊</span>
              Exportar Dados
            </button>
            <button className="action-button secondary">
              <span className="button-icon">🔄</span>
              Sincronizar
            </button>
            <button className="action-button danger">
              <span className="button-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Configuracoes;

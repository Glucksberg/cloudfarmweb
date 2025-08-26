import React, { useState } from 'react';
import './Pages.css';

const Talhoes = () => {
  const [selectedTalhao, setSelectedTalhao] = useState(null);

  const talhoes = [
    { id: 't1', nome: 'T1', area: 145, cultura: 'Milho', variedade: 'Pioneer 30F53', status: 'colheita', coords: [-47.123, -15.456] },
    { id: 't2', nome: 'T2', area: 120, cultura: 'Soja', variedade: 'TMG 7262', status: 'desenvolvimento', coords: [-47.134, -15.467] },
    { id: 't3', nome: 'T3', area: 89, cultura: 'Soja', variedade: 'OLIMPO', status: 'aplicacao', coords: [-47.145, -15.478] },
    { id: 't4', nome: 'T4', area: 156, cultura: 'Milho', variedade: 'SYN 505', status: 'plantio', coords: [-47.156, -15.489] },
    { id: 't5', nome: 'T5', area: 98, cultura: 'Soja', variedade: 'OLIMPO', status: 'preparo', coords: [-47.167, -15.500] },
    { id: 't6', nome: 'T6', area: 203, cultura: 'Algodão', variedade: 'FM 993', status: 'planejamento', coords: [-47.178, -15.511] }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'colheita': '#4CAF50',
      'desenvolvimento': '#2196F3',
      'aplicacao': '#FF9800',
      'plantio': '#9C27B0',
      'preparo': '#795548',
      'planejamento': '#607D8B'
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'colheita': '🌾',
      'desenvolvimento': '🌱',
      'aplicacao': '🚿',
      'plantio': '🌰',
      'preparo': '🚜',
      'planejamento': '📋'
    };
    return icons[status] || '📍';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🗺️ Talhões</h1>
        <p>Sistema de mapeamento e gestão de talhões</p>
      </div>

      <div className="talhoes-container">
        <div className="map-section">
          <div className="map-placeholder">
            <h3>🗺️ Mapa Interativo</h3>
            <div className="map-grid">
              {talhoes.map((talhao) => (
                <div
                  key={talhao.id}
                  className={`map-polygon ${selectedTalhao === talhao.id ? 'selected' : ''}`}
                  style={{ borderColor: getStatusColor(talhao.status) }}
                  onClick={() => setSelectedTalhao(talhao.id)}
                >
                  <span className="polygon-label">{talhao.nome}</span>
                  <span className="polygon-area">{talhao.area}ha</span>
                </div>
              ))}
            </div>
            <p className="map-note">* Integração com Mapbox será implementada</p>
          </div>
        </div>

        <div className="info-panel">
          {selectedTalhao ? (
            <div className="talhao-details">
              {(() => {
                const talhao = talhoes.find(t => t.id === selectedTalhao);
                return (
                  <>
                    <h3>{getStatusIcon(talhao.status)} {talhao.nome}</h3>
                    <div className="detail-item">
                      <span className="detail-label">Área:</span>
                      <span className="detail-value">{talhao.area} hectares</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Cultura:</span>
                      <span className="detail-value">{talhao.cultura}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Variedade:</span>
                      <span className="detail-value">{talhao.variedade}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(talhao.status) }}
                      >
                        {talhao.status}
                      </span>
                    </div>
                    
                    <div className="operations-history">
                      <h4>📋 Histórico de Operações</h4>
                      <div className="history-item">
                        <span className="history-date">23/08</span>
                        <span className="history-operation">Plantio realizado</span>
                      </div>
                      <div className="history-item">
                        <span className="history-date">20/08</span>
                        <span className="history-operation">Preparo do solo</span>
                      </div>
                      <div className="history-item">
                        <span className="history-date">18/08</span>
                        <span className="history-operation">Análise de solo</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="no-selection">
              <h3>📍 Selecione um Talhão</h3>
              <p>Clique em um talhão no mapa para ver os detalhes</p>
              
              <div className="talhoes-summary">
                <h4>Resumo dos Talhões</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-number">{talhoes.length}</span>
                    <span className="summary-label">Total de Talhões</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-number">{talhoes.reduce((sum, t) => sum + t.area, 0)}</span>
                    <span className="summary-label">Hectares Totais</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Talhoes;

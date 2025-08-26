import React, { useState } from 'react';
import './Pages.css';

const Talhoes = () => {
  const [selectedTalhao, setSelectedTalhao] = useState(null);

  const talhoes = [
    { id: 't1', nome: 'T1', area: 145, cultura: 'Milho', variedade: 'Pioneer 30F53', status: 'plantado' },
    { id: 't2', nome: 'T2', area: 120, cultura: 'Soja', variedade: 'TMG 7262', status: 'plantado' },
    { id: 't3', nome: 'T3', area: 89, cultura: 'Soja', variedade: 'OLIMPO', status: 'plantado' },
    { id: 't4', nome: 'T4', area: 156, cultura: 'Milho', variedade: 'SYN 505', status: 'plantado' },
    { id: 't5', nome: 'T5', area: 98, cultura: 'Soja', variedade: 'OLIMPO', status: 'livre' },
    { id: 't6', nome: 'T6', area: 203, cultura: 'Algodão', variedade: 'FM 993', status: 'plantado' },
    { id: 't7', nome: 'T7', area: 167, cultura: 'Milho', variedade: 'SYN 480', status: 'livre' },
    { id: 't8', nome: 'T8', area: 134, cultura: 'Soja', variedade: 'OLIMPO', status: 'plantado' },
    { id: 't9', nome: 'T9', area: 189, cultura: 'Sorgo', variedade: 'BRS 330', status: 'livre' },
    { id: 't10', nome: 'T10', area: 145, cultura: 'Soja', variedade: 'TMG 7262', status: 'plantado' },
    { id: 't11', nome: 'T11', area: 112, cultura: 'Milho', variedade: 'Pioneer 30F53', status: 'livre' },
    { id: 't12', nome: 'T12', area: 178, cultura: 'Algodão', variedade: 'FM 993', status: 'plantado' },
    { id: 't13', nome: 'T13', area: 156, cultura: 'Soja', variedade: 'OLIMPO', status: 'livre' },
    { id: 't14', nome: 'T14', area: 134, cultura: 'Milho', variedade: 'SYN 505', status: 'plantado' },
    { id: 't15', nome: 'T15', area: 167, cultura: 'Soja', variedade: 'TMG 7262', status: 'plantado' },
    { id: 't16', nome: 'T16', area: 189, cultura: 'Sorgo', variedade: 'BRS 330', status: 'livre' },
    { id: 't17', nome: 'T17', area: 145, cultura: 'Milho', variedade: 'Pioneer 30F53', status: 'plantado' },
    { id: 't18', nome: 'T18', area: 123, cultura: 'Soja', variedade: 'OLIMPO', status: 'livre' },
    { id: 't19', nome: 'T19', area: 198, cultura: 'Algodão', variedade: 'FM 993', status: 'plantado' },
    { id: 't20', nome: 'T20', area: 167, cultura: 'Milho', variedade: 'SYN 480', status: 'livre' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'plantado': '#4CAF50',
      'livre': '#FF9800'
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'plantado': '🌱',
      'livre': '🟡'
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
        <div className="talhoes-grid">
          <h3>🌾 Seleção de Talhões</h3>
          <div className="talhoes-buttons">
            {talhoes.map((talhao) => (
              <button
                key={talhao.id}
                className={`talhao-btn ${selectedTalhao === talhao.id ? 'selected' : ''}`}
                style={{ borderColor: getStatusColor(talhao.status) }}
                onClick={() => setSelectedTalhao(talhao.id)}
              >
                <span className="btn-label">{talhao.nome}</span>
                <span className="btn-area">{talhao.area}ha</span>
                <span className="btn-status" style={{ color: getStatusColor(talhao.status) }}>
                  {getStatusIcon(talhao.status)}
                </span>
              </button>
            ))}
          </div>
          <p className="navigation-note">
            💡 <strong>Dica:</strong> Para visualizar os talhões no mapa, acesse a seção <strong>Mapas</strong> no menu lateral.
          </p>
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
                        {getStatusIcon(talhao.status)} {talhao.status}
                      </span>
                    </div>
                    
                    <div className="operations-history">
                      <h4>📋 Histórico de Operações</h4>
                      <div className="history-item">
                        <span className="history-date">25/08</span>
                        <span className="history-operation">{talhao.status === 'plantado' ? 'Plantio realizado' : 'Colheita finalizada'}</span>
                      </div>
                      <div className="history-item">
                        <span className="history-date">22/08</span>
                        <span className="history-operation">{talhao.status === 'plantado' ? 'Aplicação de fertilizante' : 'Preparo do solo'}</span>
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
                  <div className="summary-item plantado">
                    <span className="summary-number">{talhoes.filter(t => t.status === 'plantado').length}</span>
                    <span className="summary-label">Plantados</span>
                  </div>
                  <div className="summary-item livre">
                    <span className="summary-number">{talhoes.filter(t => t.status === 'livre').length}</span>
                    <span className="summary-label">Livres</span>
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

import React, { useState, useEffect, useRef } from 'react';
import './Pages.css';

const Talhoes = () => {
  const [selectedTalhao, setSelectedTalhao] = useState(null);
  const mapContainer = useRef(null);

  // Função para implementar Mapbox e destacar talhão selecionado
  useEffect(() => {
    // TODO: Implementar Mapbox GL JS aqui
    // import mapboxgl from 'mapbox-gl';
    // mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
    // 
    // const map = new mapboxgl.Map({
    //   container: mapContainer.current,
    //   style: 'mapbox://styles/mapbox/satellite-streets-v12',
    //   center: [-47.15, -15.48], // Coordenadas da fazenda
    //   zoom: 14
    // });
    //
    // // Adicionar polígonos dos talhões
    // // Implementar destaque do talhão selecionado
    // if (selectedTalhao) {
    //   // Destacar talhão no mapa
    //   highlightTalhaoOnMap(selectedTalhao);
    // }
  }, [selectedTalhao]);

  // Função para destacar talhão no mapa (será implementada com Mapbox)
  const highlightTalhaoOnMap = (talhaoId) => {
    // TODO: Lógica para destacar o talhão selecionado no Mapbox
    console.log('Destacando talhão no mapa:', talhaoId);
  };

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
        <h1>🗺️ Talhões e Mapa</h1>
        <p>Sistema integrado de mapeamento e gestão de talhões</p>
      </div>

      {/* Seleção de Talhões */}
      <div className="talhoes-selection">
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
        <p className="integration-note">
          💡 <strong>Interação:</strong> Clique em um talhão acima para destacá-lo no mapa abaixo.
        </p>

        {selectedTalhao && (
          <div className="selected-talhao-panel">
            {(() => {
              const talhao = talhoes.find(t => t.id === selectedTalhao);
              return (
                <div className="selected-info">
                  <h3>{getStatusIcon(talhao.status)} {talhao.nome} - {talhao.area}ha</h3>
                  <div className="quick-info">
                    <span className="info-item">{talhao.cultura} - {talhao.variedade}</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(talhao.status) }}
                    >
                      {talhao.status}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Controles do Mapa */}
      <div className="map-controls">
        <div className="control-panel">
          <h3>🎛️ Controles do Mapa</h3>
          <div className="controls-grid">
            <button className="control-btn">
              <span className="control-icon">🌾</span>
              <span className="control-label">Talhões</span>
            </button>
            <button className="control-btn">
              <span className="control-icon">📍</span>
              <span className="control-label">Máquinas</span>
            </button>
            <button className="control-btn">
              <span className="control-icon">🚿</span>
              <span className="control-label">Aplicações</span>
            </button>
            <button className="control-btn">
              <span className="control-icon">📏</span>
              <span className="control-label">Medir Área</span>
            </button>
          </div>
        </div>

        <div className="layer-panel">
          <h3>🗂️ Camadas</h3>
          <div className="layer-list">
            <label className="layer-item">
              <input type="checkbox" defaultChecked />
              <span className="layer-name">Base Satellite</span>
            </label>
            <label className="layer-item">
              <input type="checkbox" defaultChecked />
              <span className="layer-name">Talhões</span>
            </label>
            <label className="layer-item">
              <input type="checkbox" />
              <span className="layer-name">Curvas de Nível</span>
            </label>
            <label className="layer-item">
              <input type="checkbox" />
              <span className="layer-name">Drenagem</span>
            </label>
          </div>
        </div>
      </div>

      {/* Container do Mapa */}
      <div className="map-container-wrapper">
        <div 
          ref={mapContainer} 
          className="mapbox-container"
          style={{ width: '100%', height: '500px' }}
        >
          {/* Placeholder até implementar Mapbox */}
          <div className="map-placeholder">
            <div className="placeholder-content">
              <h2>🗺️ Mapa Interativo</h2>
              <p>Integração com Mapbox será implementada aqui</p>
              {selectedTalhao && (
                <div className="selected-highlight">
                  <p><strong>Talhão Selecionado:</strong> {selectedTalhao.toUpperCase()}</p>
                  <p>Este talhão será destacado no mapa</p>
                </div>
              )}
              <div className="map-features">
                <div className="feature-item">
                  <span className="feature-icon">🛰️</span>
                  <span className="feature-text">Imagens de Satélite</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📐</span>
                  <span className="feature-text">Ferramentas de Desenho</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📍</span>
                  <span className="feature-text">Geolocalização em Tempo Real</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span className="feature-text">Análises Geoespaciais</span>
                </div>
              </div>
              <div className="integration-note">
                <p><strong>Próximos passos:</strong></p>
                <ul>
                  <li>• Configurar Mapbox Access Token</li>
                  <li>• Implementar mapbox-gl library</li>
                  <li>• Conectar com dados dos talhões</li>
                  <li>• Destacar talhão selecionado</li>
                  <li>• Adicionar ferramentas de desenho</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="system-info">
        <div className="info-cards">
          <div className="info-card">
            <span className="info-icon">📡</span>
            <div className="info-content">
              <span className="info-title">Coordenadas Base</span>
              <span className="info-value">-47.15, -15.48</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">📏</span>
            <div className="info-content">
              <span className="info-title">Área Total</span>
              <span className="info-value">{talhoes.reduce((sum, t) => sum + t.area, 0)} ha</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🌾</span>
            <div className="info-content">
              <span className="info-title">Talhões Ativos</span>
              <span className="info-value">{talhoes.length} unidades</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🌱</span>
            <div className="info-content">
              <span className="info-title">Plantados</span>
              <span className="info-value">{talhoes.filter(t => t.status === 'plantado').length} talhões</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes do Talhão Selecionado */}
      {selectedTalhao && (
        <div className="talhao-details-section">
          {(() => {
            const talhao = talhoes.find(t => t.id === selectedTalhao);
            return (
              <div className="details-container">
                <h3>📊 Detalhes - {talhao.nome}</h3>
                <div className="details-grid">
                  <div className="detail-card">
                    <h4>🌿 Informações Gerais</h4>
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
                  </div>
                  
                  <div className="detail-card">
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
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Talhoes;

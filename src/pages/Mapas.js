import React, { useEffect, useRef } from 'react';
import './Pages.css';

const Mapas = () => {
  const mapContainer = useRef(null);

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
    // // Adicionar marcadores dos talhões
    // // Adicionar controles de desenho
    // // Implementar popups informativos
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🗺️ Mapas</h1>
        <p>Visualização geoespacial dos talhões e operações</p>
      </div>

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

      <div className="map-container-wrapper">
        <div 
          ref={mapContainer} 
          className="mapbox-container"
          style={{ width: '100%', height: '600px' }}
        >
          {/* Placeholder até implementar Mapbox */}
          <div className="map-placeholder">
            <div className="placeholder-content">
              <h2>🗺️ Mapa Interativo</h2>
              <p>Integração com Mapbox será implementada aqui</p>
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
                  <li>• Adicionar ferramentas de desenho</li>
                  <li>• Integrar com WebSocket para tempo real</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-info">
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
              <span className="info-value">1.847 ha</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🌾</span>
            <div className="info-content">
              <span className="info-title">Talhões Ativos</span>
              <span className="info-value">20 unidades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mapas;

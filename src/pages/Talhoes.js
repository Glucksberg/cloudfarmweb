import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Pages.css';
import {
  blockMapboxTelemetry,
  getRestrictiveMapConfig,
  createSafeMapCleanup,
  createSafeEventHandlers
} from '../utils/mapboxConfig';

// Ensure telemetry is blocked
blockMapboxTelemetry();

const Talhoes = () => {
  const [selectedTalhao, setSelectedTalhao] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const componentMounted = useRef(true);

  // Sempre usar satélite + labels (sem alternância)

  // Adicionar supressor de erros específico para este componente
  useEffect(() => {
    const handleError = (event) => {
      const error = event.error || event.reason;
      if (error && (error.message?.includes('AbortError') || error.message?.includes('signal is aborted'))) {
        console.warn('🔇 AbortError suprimido no componente Talhões:', error.message);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      componentMounted.current = false;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // Não precisa mais de função para alternar - sempre satélite + labels

  // Função para atualizar talhão selecionado (extraída para reutilização)
  const updateSelectedTalhao = (talhaoId) => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remover destaque anterior
      if (map.current.getLayer && map.current.getLayer('talhao-highlight')) {
        map.current.removeLayer('talhao-highlight');
      }
      if (map.current.getSource && map.current.getSource('talhao-highlight')) {
        map.current.removeSource('talhao-highlight');
      }

      // Adicionar destaque do talhão selecionado
      const selectedTalhaoData = talhoes.find(t => t.id === talhaoId);
      if (selectedTalhaoData) {
        const highlightData = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [getTalhaoCoordinates(talhaoId)]
            }
          }]
        };

        map.current.addSource('talhao-highlight', {
          type: 'geojson',
          data: highlightData
        });

        map.current.addLayer({
          id: 'talhao-highlight',
          type: 'line',
          source: 'talhao-highlight',
          paint: {
            'line-color': '#FF0000',
            'line-width': 4
          }
        });

        // Centralizar mapa no talhão selecionado
        const bounds = new mapboxgl.LngLatBounds();
        getTalhaoCoordinates(talhaoId).forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error('Erro ao destacar talhão:', error);
    }
  };

  // Configurar Mapbox Token (usar variável de ambiente)
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';

  // Debug - verificar token
  console.log('Mapbox Token:', mapboxgl.accessToken ? 'Token carregado' : 'Token não encontrado');
  console.log('Token length:', mapboxgl.accessToken?.length);

  // Dados de exemplo dos talhões com coordenadas
  const getTalhaoCoordinates = (talhaoId) => {
    const coordinates = {
      't1': [[-47.123, -15.456], [-47.122, -15.456], [-47.122, -15.457], [-47.123, -15.457], [-47.123, -15.456]],
      't2': [[-47.124, -15.458], [-47.123, -15.458], [-47.123, -15.459], [-47.124, -15.459], [-47.124, -15.458]],
      't3': [[-47.125, -15.460], [-47.124, -15.460], [-47.124, -15.461], [-47.125, -15.461], [-47.125, -15.460]],
      't4': [[-47.126, -15.462], [-47.125, -15.462], [-47.125, -15.463], [-47.126, -15.463], [-47.126, -15.462]],
      't5': [[-47.127, -15.464], [-47.126, -15.464], [-47.126, -15.465], [-47.127, -15.465], [-47.127, -15.464]],
      't6': [[-47.128, -15.466], [-47.127, -15.466], [-47.127, -15.467], [-47.128, -15.467], [-47.128, -15.466]],
      't7': [[-47.129, -15.468], [-47.128, -15.468], [-47.128, -15.469], [-47.129, -15.469], [-47.129, -15.468]],
      't8': [[-47.130, -15.470], [-47.129, -15.470], [-47.129, -15.471], [-47.130, -15.471], [-47.130, -15.470]],
      't9': [[-47.131, -15.472], [-47.130, -15.472], [-47.130, -15.473], [-47.131, -15.473], [-47.131, -15.472]],
      't10': [[-47.132, -15.474], [-47.131, -15.474], [-47.131, -15.475], [-47.132, -15.475], [-47.132, -15.474]],
      't11': [[-47.133, -15.476], [-47.132, -15.476], [-47.132, -15.477], [-47.133, -15.477], [-47.133, -15.476]],
      't12': [[-47.134, -15.478], [-47.133, -15.478], [-47.133, -15.479], [-47.134, -15.479], [-47.134, -15.478]],
      't13': [[-47.135, -15.480], [-47.134, -15.480], [-47.134, -15.481], [-47.135, -15.481], [-47.135, -15.480]],
      't14': [[-47.136, -15.482], [-47.135, -15.482], [-47.135, -15.483], [-47.136, -15.483], [-47.136, -15.482]],
      't15': [[-47.137, -15.484], [-47.136, -15.484], [-47.136, -15.485], [-47.137, -15.485], [-47.137, -15.484]],
      't16': [[-47.138, -15.486], [-47.137, -15.486], [-47.137, -15.487], [-47.138, -15.487], [-47.138, -15.486]],
      't17': [[-47.139, -15.488], [-47.138, -15.488], [-47.138, -15.489], [-47.139, -15.489], [-47.139, -15.488]],
      't18': [[-47.140, -15.490], [-47.139, -15.490], [-47.139, -15.491], [-47.140, -15.491], [-47.140, -15.490]],
      't19': [[-47.141, -15.492], [-47.140, -15.492], [-47.140, -15.493], [-47.141, -15.493], [-47.141, -15.492]],
      't20': [[-47.142, -15.494], [-47.141, -15.494], [-47.141, -15.495], [-47.142, -15.495], [-47.142, -15.494]]
    };
    return coordinates[talhaoId] || [];
  };

  // Inicializar Mapbox
  useEffect(() => {
    if (map.current) return; // Mapa já inicializado

    console.log('🗺️ Inicializando Mapbox Talhões com sistema anti-telemetria...');

    const abortController = new AbortController();

    // Verificações básicas
    if (!mapContainer.current) {
      console.error('❌ Container do mapa não encontrado!');
      return;
    }

    if (!mapboxgl.supported()) {
      console.error('❌ WebGL não suportado');
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: red;">
            <h3>🚫 Navegador não suportado</h3>
            <p>Este navegador não suporta Mapbox GL JS</p>
            <p>Tente usar Chrome, Firefox ou Safari</p>
          </div>
        `;
      }
      return;
    }

    // Configurar token
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';

    if (!mapboxgl.accessToken) {
      console.error('❌ Token do Mapbox não encontrado!');
      return;
    }

    console.log('✅ Token Mapbox:', mapboxgl.accessToken.substring(0, 20) + '...');

    try {
      // Usar configuração restritiva sempre com satélite + labels
      const mapConfig = getRestrictiveMapConfig(
        mapContainer.current,
        'mapbox://styles/mapbox/satellite-streets-v12',  // Sempre satélite + labels
        [-47.15, -15.48],
        12
      );

      console.log('🔧 Criando mapa com configuração anti-telemetria...');
      const mapInstance = new mapboxgl.Map(mapConfig);
      map.current = mapInstance;

      // Adicionar controles de navegação
      mapInstance.addControl(new mapboxgl.NavigationControl());
      console.log('🎮 Controles de navegação adicionados');

      // Usar handlers seguros de eventos
      const handlers = createSafeEventHandlers(abortController);

      mapInstance.on('load', handlers.onLoad(() => {
        console.log('🎉 Mapa carregado com sucesso!');
        try {
          // Adicionar polígonos dos talhões
          addTalhoesLayer();

          // Marcar mapa como carregado
          setMapLoaded(true);
          console.log('✅ Layers adicionadas e mapa marcado como carregado');

          // Adicionar listener para clique no mapa
          mapInstance.on('click', 'talhoes-layer', (e) => {
            if (!handlers.isMounted()) return;
            try {
              if (e.features.length > 0) {
                const talhaoId = e.features[0].properties.id;
                console.log('🎯 Talhão clicado no mapa:', talhaoId);
                setSelectedTalhao(talhaoId);
              }
            } catch (error) {
              console.warn('⚠️ Erro no clique do talhão (ignorado):', error.message);
            }
          });

          // Mudar cursor ao passar sobre os talhões
          mapInstance.on('mouseenter', 'talhoes-layer', () => {
            if (!handlers.isMounted()) return;
            try {
              if (mapInstance && mapInstance.getCanvas) {
                mapInstance.getCanvas().style.cursor = 'pointer';
              }
            } catch (error) {
              console.warn('⚠️ Erro no mouseenter (ignorado):', error.message);
            }
          });

          mapInstance.on('mouseleave', 'talhoes-layer', () => {
            if (!handlers.isMounted()) return;
            try {
              if (mapInstance && mapInstance.getCanvas) {
                mapInstance.getCanvas().style.cursor = '';
              }
            } catch (error) {
              console.warn('⚠️ Erro no mouseleave (ignorado):', error.message);
            }
          });
        } catch (error) {
          console.error('❌ Erro ao configurar mapa:', error);
        }
      }));

      mapInstance.on('error', handlers.onError((e) => {
        console.error('❌ Erro do Mapbox:', e.error);
      }));

    } catch (error) {
      console.error('❌ Erro ao criar mapa:', error);
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: red;">
            <h3>❌ Erro ao carregar o mapa</h3>
            <p><strong>Detalhes:</strong> ${error.message}</p>
            <p><small>Verifique a conexão de internet e o token do Mapbox</small></p>
          </div>
        `;
      }
      return;
    }

    return createSafeMapCleanup(map, abortController);
  }, []);

  // Função para adicionar camada dos talhões
  const addTalhoesLayer = () => {
    console.log('Adicionando layers dos talhões...');

    const geojsonData = {
      type: 'FeatureCollection',
      features: talhoes.map((talhao) => ({
        type: 'Feature',
        properties: {
          id: talhao.id,
          nome: talhao.nome,
          area: talhao.area,
          cultura: talhao.cultura,
          status: talhao.status
        },
        geometry: {
          type: 'Polygon',
          coordinates: [getTalhaoCoordinates(talhao.id)]
        }
      }))
    };

    console.log('GeoJSON data:', geojsonData);

    map.current.addSource('talhoes', {
      type: 'geojson',
      data: geojsonData
    });

    // Layer de preenchimento
    map.current.addLayer({
      id: 'talhoes-layer',
      type: 'fill',
      source: 'talhoes',
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'status'], 'plantado'], '#4CAF50',
          ['==', ['get', 'status'], 'livre'], '#FF9800',
          '#757575'
        ],
        'fill-opacity': 0.6
      }
    });

    // Layer de borda
    map.current.addLayer({
      id: 'talhoes-border',
      type: 'line',
      source: 'talhoes',
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 2
      }
    });
  };

  // Função para destacar talhão selecionado
  useEffect(() => {
    if (!selectedTalhao) return;
    updateSelectedTalhao(selectedTalhao);
  }, [selectedTalhao, mapLoaded]);

  const talhoes = [
    { id: 't1', nome: 'T1', area: 145, cultura: 'Milho', variedade: 'Pioneer 30F53', status: 'plantado' },
    { id: 't2', nome: 'T2', area: 120, cultura: 'Soja', variedade: 'TMG 7262', status: 'plantado' },
    { id: 't3', nome: 'T3', area: 89, cultura: 'Soja', variedade: 'OLIMPO', status: 'plantado' },
    { id: 't4', nome: 'T4', area: 156, cultura: 'Milho', variedade: 'SYN 505', status: 'plantado' },
    { id: 't5', nome: 'T5', area: 98, cultura: 'Soja', variedade: 'OLIMPO', status: 'livre' },
    { id: 't6', nome: 'T6', area: 203, cultura: 'Algod��o', variedade: 'FM 993', status: 'plantado' },
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
              <input
                type="checkbox"
                checked={layers.satellite}
                onChange={() => toggleMapStyle('satellite')}
              />
              <span className="layer-name">
                🛰️ Satélite + Labels {layers.satellite && '(Ativo)'}
              </span>
            </label>
            <label className="layer-item">
              <input
                type="checkbox"
                checked={layers.talhoes}
                onChange={() => toggleMapStyle('talhoes')}
              />
              <span className="layer-name">
                🌾 Talhões {layers.talhoes && '(Visível)'}
              </span>
            </label>
          </div>

        </div>
      </div>

      {/* Container do Mapa */}
      <div className="map-container-wrapper">
        <div
          ref={mapContainer}
          className="mapbox-container"
          style={{
            width: '100%',
            height: '500px',
            backgroundColor: '#f0f0f0',
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Mapa Mapbox */}
          {!mapLoaded && (
            <div className="map-loading">
              <h3>🗺️ Carregando Mapa...</h3>
              <p>Inicializando Mapbox GL JS</p>
            </div>
          )}

          {selectedTalhao && (
            <div className="map-overlay">
              <div className="selected-indicator">
                🎯 Talhão {selectedTalhao.toUpperCase()} selecionado
              </div>
            </div>
          )}
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

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from 'turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './Pages.css';
import './DrawTools.css';

const Talhoes = () => {
  const [selectedTalhao, setSelectedTalhao] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [drawnGeometry, setDrawnGeometry] = useState(null);
  const [newTalhaoData, setNewTalhaoData] = useState({
    nome: '',
    cultura: 'Soja',
    variedade: '',
    status: 'livre'
  });
  const [showNewTalhaoForm, setShowNewTalhaoForm] = useState(false);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [currentTalhoes, setCurrentTalhoes] = useState([]);

  // Função para destacar talhão selecionado
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
      const selectedTalhaoData = currentTalhoes.find(t => t.id === talhaoId);
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

  // Função para calcular área usando Turf
  const calculateArea = (geometry) => {
    try {
      const feature = {
        type: 'Feature',
        geometry: geometry
      };
      const area = turf.area(feature);
      return (area / 10000).toFixed(2); // Converter de m² para hectares
    } catch (error) {
      console.error('Erro ao calcular área:', error);
      return 0;
    }
  };

  // Função para validar geometria
  const validateGeometry = (geometry) => {
    try {
      if (!geometry || geometry.type !== 'Polygon') {
        return { valid: false, error: 'Geometria deve ser um polígono' };
      }

      const feature = {
        type: 'Feature',
        geometry: geometry
      };

      // Verificar se o polígono é válido
      const area = turf.area(feature);
      if (area < 100) { // Menor que 100m²
        return { valid: false, error: 'Área muito pequena (mínimo 100m²)' };
      }

      // Verificar se não tem auto-interseções (kinks)
      const kinks = turf.kinks(feature);
      if (kinks.features.length > 0) {
        return { valid: false, error: 'Polígono não pode ter auto-interseções' };
      }

      return { valid: true, area: (area / 10000).toFixed(2) };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  };

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

  // Inicializar Mapbox com ferramenta de desenho
  useEffect(() => {
    if (map.current) return;

    console.log('🗺️ Inicializando Mapbox com ferramenta de desenho...');

    if (!mapContainer.current) {
      console.error('❌ Container do mapa não encontrado!');
      return;
    }

    if (!mapboxgl.supported()) {
      console.error('❌ WebGL não suportado');
      return;
    }

    // Configurar token
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2xvdWRmYXJtYnIiLCJhIjoiY21lczV2Mnl4MGU4czJqcG96ZG1kNDFmdCJ9.GKcFLWcXdrQS2sLml5gcXA';

    try {
      // Criar mapa
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-47.15, -15.48],
        zoom: 12
      });

      map.current = mapInstance;

      // Configurar Mapbox Draw
      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select',
        styles: [
          // Estilo para polígonos em desenho
          {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'paint': {
              'fill-color': '#3bb2d0',
              'fill-outline-color': '#3bb2d0',
              'fill-opacity': 0.3
            }
          },
          {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'paint': {
              'fill-color': '#fbb03b',
              'fill-outline-color': '#fbb03b',
              'fill-opacity': 0.3
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#3bb2d0',
              'line-width': 3
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#fbb03b',
              'line-width': 3
            }
          },
          // Vértices
          {
            'id': 'gl-draw-point-point-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'static']],
            'paint': {
              'circle-radius': 5,
              'circle-color': '#fff'
            }
          },
          {
            'id': 'gl-draw-point-point-stroke-active',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
            'paint': {
              'circle-radius': 7,
              'circle-color': '#fff'
            }
          }
        ]
      });

      draw.current = drawInstance;
      mapInstance.addControl(drawInstance);

      // Adicionar controles de navegação
      mapInstance.addControl(new mapboxgl.NavigationControl());

      // Evento de carregamento
      mapInstance.on('load', () => {
        console.log('🎉 Mapa carregado com sucesso!');
        
        // Adicionar polígonos dos talhões existentes
        addTalhoesLayer();
        
        setMapLoaded(true);

        // Listeners para talhões existentes
        mapInstance.on('click', 'talhoes-layer', (e) => {
          if (e.features.length > 0) {
            const talhaoId = e.features[0].properties.id;
            console.log('🎯 Talhão clicado:', talhaoId);
            setSelectedTalhao(talhaoId);
          }
        });

        mapInstance.on('mouseenter', 'talhoes-layer', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.on('mouseleave', 'talhoes-layer', () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      });

      // Event listeners para desenho
      mapInstance.on('draw.create', (e) => {
        console.log('🖊️ Talhão desenhado:', e);
        const feature = e.features[0];
        const validation = validateGeometry(feature.geometry);
        
        if (validation.valid) {
          setDrawnGeometry(feature.geometry);
          setNewTalhaoData(prev => ({
            ...prev,
            nome: `T${currentTalhoes.length + 1}`
          }));
          setShowNewTalhaoForm(true);
          console.log('✅ Geometria válida. Área:', validation.area, 'ha');
        } else {
          alert(`❌ Erro na geometria: ${validation.error}`);
          drawInstance.delete(feature.id);
        }
      });

      mapInstance.on('draw.update', (e) => {
        console.log('✏️ Talhão editado:', e);
        const feature = e.features[0];
        const validation = validateGeometry(feature.geometry);
        
        if (!validation.valid) {
          alert(`❌ Erro na geometria: ${validation.error}`);
          drawInstance.delete(feature.id);
        }
      });

      mapInstance.on('draw.delete', (e) => {
        console.log('🗑️ Talhão deletado:', e);
        setDrawnGeometry(null);
        setShowNewTalhaoForm(false);
      });

      // Tratamento de erros
      mapInstance.on('error', (e) => {
        console.error('❌ Erro do Mapbox:', e.error);
      });

    } catch (error) {
      console.error('❌ Erro ao criar mapa:', error);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Inicializar talhões
  useEffect(() => {
    setCurrentTalhoes(initialTalhoes);
  }, []);

  // Função para adicionar camada dos talhões
  const addTalhoesLayer = () => {
    if (!map.current) return;

    console.log('🌾 Adicionando camada dos talhões...');

    const geojsonData = {
      type: 'FeatureCollection',
      features: currentTalhoes.map((talhao) => ({
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

    try {
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

      console.log('✅ Camadas dos talhões adicionadas!');
    } catch (error) {
      console.error('❌ Erro ao adicionar camadas:', error);
    }
  };

  // Atualizar talhão selecionado
  useEffect(() => {
    if (selectedTalhao && mapLoaded) {
      updateSelectedTalhao(selectedTalhao);
    }
  }, [selectedTalhao, mapLoaded]);

  // Função para ativar/desativar modo de desenho
  const toggleDrawMode = () => {
    if (!draw.current) return;

    if (drawMode) {
      draw.current.changeMode('simple_select');
      setDrawMode(false);
      console.log('🔧 Modo de desenho desativado');
    } else {
      draw.current.changeMode('draw_polygon');
      setDrawMode(true);
      console.log('🖊️ Modo de desenho ativado');
    }
  };

  // Função para salvar novo talhão
  const saveNewTalhao = () => {
    if (!drawnGeometry) return;

    const validation = validateGeometry(drawnGeometry);
    if (!validation.valid) {
      alert(`❌ Erro na geometria: ${validation.error}`);
      return;
    }

    const newTalhao = {
      id: `t${currentTalhoes.length + 1}`,
      nome: newTalhaoData.nome || `T${currentTalhoes.length + 1}`,
      area: parseFloat(validation.area),
      cultura: newTalhaoData.cultura,
      variedade: newTalhaoData.variedade,
      status: newTalhaoData.status,
      geometry: drawnGeometry // Armazenar geometria real
    };

    setCurrentTalhoes(prev => [...prev, newTalhao]);
    
    // Limpar formulário
    setShowNewTalhaoForm(false);
    setDrawnGeometry(null);
    setNewTalhaoData({
      nome: '',
      cultura: 'Soja',
      variedade: '',
      status: 'livre'
    });

    // Sair do modo de desenho
    if (draw.current) {
      draw.current.deleteAll();
      draw.current.changeMode('simple_select');
      setDrawMode(false);
    }

    console.log('✅ Novo talhão salvo:', newTalhao);
    
    // Recarregar camada dos talhões
    setTimeout(() => {
      if (map.current.getSource('talhoes')) {
        const updatedGeojson = {
          type: 'FeatureCollection',
          features: [...currentTalhoes, newTalhao].map((talhao) => ({
            type: 'Feature',
            properties: {
              id: talhao.id,
              nome: talhao.nome,
              area: talhao.area,
              cultura: talhao.cultura,
              status: talhao.status
            },
            geometry: talhao.geometry || {
              type: 'Polygon',
              coordinates: [getTalhaoCoordinates(talhao.id)]
            }
          }))
        };
        map.current.getSource('talhoes').setData(updatedGeojson);
      }
    }, 100);
  };

  // Dados dos talhões iniciais
  const initialTalhoes = [
    { id: 't1', nome: 'T1', area: 145, cultura: 'Milho', variedade: 'Pioneer 30F53', status: 'plantado' },
    { id: 't2', nome: 'T2', area: 120, cultura: 'Soja', variedade: 'TMG 7262', status: 'plantado' },
    { id: 't3', nome: 'T3', area: 89, cultura: 'Soja', variedade: 'OLIMPO', status: 'plantado' },
    { id: 't4', nome: 'T4', area: 156, cultura: 'Milho', variedade: 'SYN 505', status: 'plantado' },
    { id: 't5', nome: 'T5', area: 98, cultura: 'Soja', variedade: 'OLIMPO', status: 'livre' },
    { id: 't6', nome: 'T6', area: 203, cultura: 'Algodão', variedade: 'FM 993', status: 'plantado' },
    { id: 't7', nome: 'T7', area: 167, cultura: 'Milho', variedade: 'SYN 480', status: 'livre' },
    { id: 't8', nome: 'T8', area: 134, cultura: 'Soja', variedade: 'OLIMPO', status: 'plantado' },
    { id: 't9', nome: 'T9', area: 189, cultura: 'Sorgo', variedade: 'BRS 330', status: 'livre' },
    { id: 't10', nome: 'T10', area: 145, cultura: 'Soja', variedade: 'TMG 7262', status: 'plantado' }
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
        <p>Sistema de mapeamento com desenho interativo de talhões</p>
      </div>

      {/* Seleção de Talhões */}
      <div className="talhoes-selection">
        <h3>🌾 Talhões Cadastrados ({currentTalhoes.length})</h3>
        <div className="talhoes-buttons">
          {currentTalhoes.map((talhao) => (
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

        {selectedTalhao && (
          <div className="selected-talhao-panel">
            {(() => {
              const talhao = currentTalhoes.find(t => t.id === selectedTalhao);
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

      {/* Ferramentas de Desenho */}
      <div className="draw-tools">
        <h3>🖊️ Ferramentas de Desenho</h3>
        <div className="draw-controls">
          <button 
            className={`draw-btn ${drawMode ? 'active' : ''}`}
            onClick={toggleDrawMode}
            style={{
              backgroundColor: drawMode ? '#2196f3' : '#f0f0f0',
              color: drawMode ? 'white' : '#333',
              border: `2px solid ${drawMode ? '#2196f3' : '#ccc'}`,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {drawMode ? '🛑' : '🖊️'} 
            {drawMode ? 'Cancelar Desenho' : 'Desenhar Novo Talhão'}
          </button>

          {drawMode && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #2196f3',
              marginTop: '1rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#1976d2' }}>
                <strong>📋 Instruções:</strong>
                <br />
                • Clique no mapa para adicionar pontos do polígono
                <br />
                • Clique no primeiro ponto novamente para fechar
                <br />
                • Use as ferramentas do Mapbox Draw para editar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Formulário para Novo Talhão */}
      {showNewTalhaoForm && drawnGeometry && (
        <div className="new-talhao-form" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '400px'
        }}>
          <h3>🆕 Novo Talhão Desenhado</h3>
          <p>Área calculada: <strong>{calculateArea(drawnGeometry)} hectares</strong></p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Nome do Talhão:</label>
            <input 
              type="text" 
              value={newTalhaoData.nome}
              onChange={(e) => setNewTalhaoData(prev => ({...prev, nome: e.target.value}))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Cultura:</label>
            <select 
              value={newTalhaoData.cultura}
              onChange={(e) => setNewTalhaoData(prev => ({...prev, cultura: e.target.value}))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="Soja">Soja</option>
              <option value="Milho">Milho</option>
              <option value="Algodão">Algodão</option>
              <option value="Sorgo">Sorgo</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Variedade:</label>
            <input 
              type="text" 
              value={newTalhaoData.variedade}
              onChange={(e) => setNewTalhaoData(prev => ({...prev, variedade: e.target.value}))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              placeholder="Ex: TMG 7262"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Status:</label>
            <select 
              value={newTalhaoData.status}
              onChange={(e) => setNewTalhaoData(prev => ({...prev, status: e.target.value}))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="livre">Livre</option>
              <option value="plantado">Plantado</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={saveNewTalhao}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✅ Salvar Talhão
            </button>
            <button 
              onClick={() => {
                setShowNewTalhaoForm(false);
                setDrawnGeometry(null);
                draw.current?.deleteAll();
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Overlay para formulário */}
      {showNewTalhaoForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }} />
      )}

      {/* Container do Mapa */}
      <div className="map-container-wrapper">
        <div
          ref={mapContainer}
          className="mapbox-container"
          style={{
            width: '100%',
            height: '600px',
            backgroundColor: '#f0f0f0',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            position: 'relative'
          }}
        >
          {!mapLoaded && (
            <div className="map-loading" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <h3>🗺️ Carregando Mapa com Ferramenta de Desenho...</h3>
              <p>Inicializando Mapbox GL Draw</p>
            </div>
          )}

          {/* Indicador de modo de desenho */}
          {drawMode && mapLoaded && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 1000,
              backgroundColor: 'rgba(33, 150, 243, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              🖊️ MODO DESENHO ATIVO
            </div>
          )}

          {/* Indicador de talhão selecionado */}
          {selectedTalhao && mapLoaded && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              🎯 Talhão {selectedTalhao.toUpperCase()} selecionado
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
              <span className="info-value">{currentTalhoes.reduce((sum, t) => sum + t.area, 0)} ha</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🌾</span>
            <div className="info-content">
              <span className="info-title">Talhões Cadastrados</span>
              <span className="info-value">{currentTalhoes.length} unidades</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🖊️</span>
            <div className="info-content">
              <span className="info-title">Ferramenta Desenho</span>
              <span className="info-value">{drawMode ? 'Ativa' : 'Inativa'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Talhoes;

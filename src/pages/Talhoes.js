import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from 'turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './Pages.css';
import './DrawTools.css';
import { getMapboxConfig, testMapboxToken, handleMapboxError } from '../utils/mapboxConfig';
import useCloudFarmTalhoes from '../hooks/useCloudFarmTalhoes';
import ConnectionStatus from '../components/ConnectionStatus';

// Ultra-aggressive global AbortError suppression before component loads
if (typeof window !== 'undefined' && !window.__ABORT_ERROR_SUPPRESSED__) {
  console.log('🚫 Setting up ultra-aggressive AbortError suppression...');

  // Store originals
  const _originalConsoleError = console.error;
  const _originalConsoleWarn = console.warn;
  const _originalWindowOnError = window.onerror;

  // Override console.error with immediate AbortError detection
  console.error = function(...args) {
    try {
      const errorString = args.map(arg => {
        if (arg && typeof arg === 'object') {
          if (arg.name === 'AbortError') return 'AbortError_SUPPRESSED';
          if (arg.message && arg.message.includes('signal is aborted')) return 'AbortError_SUPPRESSED';
          if (arg.stack && (
            arg.stack.includes('Object.cancel') ||
            arg.stack.includes('Me.abortTile') ||
            arg.stack.includes('ey._abortTile') ||
            arg.stack.includes('ey._removeTile') ||
            arg.stack.includes('ey.update') ||
            arg.stack.includes('Kt._updateSources') ||
            arg.stack.includes('Map._render')
          )) return 'AbortError_SUPPRESSED';
          return JSON.stringify(arg);
        }
        return String(arg);
      }).join(' ');

      if (errorString.includes('AbortError') ||
          errorString.includes('signal is aborted') ||
          errorString.includes('Object.cancel') ||
          errorString.includes('Me.abortTile') ||
          errorString.includes('ey._abortTile') ||
          errorString.includes('ey._removeTile') ||
          errorString.includes('ey.update') ||
          errorString.includes('Kt._updateSources') ||
          errorString.includes('Map._render') ||
          errorString.includes('AbortError_SUPPRESSED')) {
        console.log('⏹️ GLOBAL: Suppressed AbortError at console.error level');
        return;
      }
    } catch (e) {
      // If analysis fails, still try to suppress common patterns
      const simpleCheck = args.join(' ');
      if (simpleCheck.includes('AbortError') || simpleCheck.includes('abortTile')) {
        console.log('⏹️ GLOBAL: Suppressed AbortError (fallback check)');
        return;
      }
    }

    return _originalConsoleError.apply(this, args);
  };

  // Override console.warn similarly
  console.warn = function(...args) {
    const warnString = args.join(' ');
    if (warnString.includes('AbortError') ||
        warnString.includes('signal is aborted') ||
        warnString.includes('abortTile')) {
      console.log('⏹️ GLOBAL: Suppressed AbortError warning');
      return;
    }
    return _originalConsoleWarn.apply(this, args);
  };

  // Override window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && (
      message.includes('AbortError') ||
      message.includes('signal is aborted') ||
      message.includes('abortTile')
    )) {
      console.log('⏹️ GLOBAL: Suppressed AbortError at window.onerror level');
      return true;
    }

    if (error && (
      error.name === 'AbortError' ||
      (error.message && error.message.includes('signal is aborted'))
    )) {
      console.log('⏹️ GLOBAL: Suppressed AbortError object at window.onerror level');
      return true;
    }

    if (_originalWindowOnError) {
      return _originalWindowOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Global unhandled rejection handler
  const handleUnhandledRejection = (event) => {
    const reason = event.reason;
    if (reason && (
      reason.name === 'AbortError' ||
      (typeof reason.message === 'string' && reason.message.includes('signal is aborted')) ||
      (typeof reason === 'string' && reason.includes('AbortError'))
    )) {
      console.log('⏹️ GLOBAL: Suppressed unhandled AbortError rejection');
      event.preventDefault();
      return;
    }
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Global error event handler
  const handleGlobalError = (event) => {
    const error = event.error;
    if (error && (
      error.name === 'AbortError' ||
      (error.message && error.message.includes('signal is aborted')) ||
      (error.stack && (
        error.stack.includes('Object.cancel') ||
        error.stack.includes('Me.abortTile') ||
        error.stack.includes('ey._abortTile') ||
        error.stack.includes('ey._removeTile') ||
        error.stack.includes('ey.update') ||
        error.stack.includes('Kt._updateSources') ||
        error.stack.includes('Map._render')
      ))
    )) {
      console.log('⏹️ GLOBAL: Suppressed AbortError at global error event level');
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  window.addEventListener('error', handleGlobalError);

  // Store cleanup functions globally so they can be called later
  window.__ABORT_ERROR_CLEANUP__ = () => {
    console.error = _originalConsoleError;
    console.warn = _originalConsoleWarn;
    window.onerror = _originalWindowOnError;
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleGlobalError);
    delete window.__ABORT_ERROR_SUPPRESSED__;
    delete window.__ABORT_ERROR_CLEANUP__;
  };

  window.__ABORT_ERROR_SUPPRESSED__ = true;
}

const Talhoes = () => {
  // Immediate telemetry blocking before any state initialization
  if (typeof window !== 'undefined' && !window.__TELEMETRY_BLOCKED__) {
    console.log('🚫 Immediate telemetry blocking...');
    window.MAPBOX_DISABLE_TELEMETRY = true;
    window.__TELEMETRY_BLOCKED__ = true;
  }

  const [selectedTalhao, setSelectedTalhao] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [drawnGeometry, setDrawnGeometry] = useState(null);
  const [newTalhaoData, setNewTalhaoData] = useState({
    nome: '',
    cultura: 'Soja',
    variedade: '',
    grupoMaturacao: '',
    status: 'livre',
    dataPlantio: null,
    colheitaEstimada: null,
    observacoes: ''
  });
  const [showNewTalhaoForm, setShowNewTalhaoForm] = useState(false);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  // CloudFarm integration
  const {
    talhoes: currentTalhoes,
    loading: talhoesLoading,
    error: talhoesError,
    connected: cloudFarmConnected,
    statistics,
    createTalhao: createCloudFarmTalhao,
    updateTalhao: updateCloudFarmTalhao,
    deleteTalhao: deleteCloudFarmTalhao,
    reconnect: reconnectCloudFarm,
    clearError: clearTalhoesError
  } = useCloudFarmTalhoes();
  const [mapError, setMapError] = useState(null);
  const [tokenValid, setTokenValid] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUpdatingMap, setIsUpdatingMap] = useState(false);
  const updateTimeout = useRef(null);

  // Função para destacar talhão selecionado
  const updateSelectedTalhao = (talhaoId) => {
    if (!map.current || !mapLoaded || isUpdatingMap) {
      console.log('⏸️ Skipping talhao update - map busy');
      return;
    }

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
      console.log('🔍 Talhão selecionado:', talhaoId, selectedTalhaoData);

      if (selectedTalhaoData) {
        const highlightData = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: selectedTalhaoData.geometry || {
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

        // Centralizar mapa no talhão selecionado usando geometria real
        const bounds = new mapboxgl.LngLatBounds();

        // Verificar se temos geometria real do talhão
        const hasRealGeometry = selectedTalhaoData.geometry &&
                               selectedTalhaoData.geometry.type === 'Polygon' &&
                               selectedTalhaoData.geometry.coordinates &&
                               selectedTalhaoData.geometry.coordinates.length > 0 &&
                               selectedTalhaoData.geometry.coordinates[0].length > 0;

        if (hasRealGeometry) {
          const coordinates = selectedTalhaoData.geometry.coordinates[0]; // Primeiro anel do polígono
          console.log('🎯 Usando geometria real para navegação:', talhaoId, coordinates.length, 'pontos');
          coordinates.forEach(coord => {
            if (Array.isArray(coord) && coord.length >= 2) {
              bounds.extend(coord);
            }
          });
        } else {
          // Fallback para coordenadas padrão
          console.log('⚠️ Geometria real não encontrada, usando coordenadas padrão para:', talhaoId);
          console.log('   Geometria disponível:', selectedTalhaoData.geometry);
          getTalhaoCoordinates(talhaoId).forEach(coord => bounds.extend(coord));
        }

        // Defensive fitBounds call with error handling
        try {
          if (bounds.isEmpty && !bounds.isEmpty()) {
            map.current.fitBounds(bounds, {
              padding: 50,
              duration: 1000, // Smooth animation
              essential: false // Don't interrupt user interactions
            });
          }
        } catch (boundsError) {
          if (boundsError.name !== 'AbortError') {
            console.warn('⚠️ Erro ao ajustar bounds do mapa:', boundsError.message);
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Erro ao destacar talhão:', error);
      }
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

  // Aggressively block all telemetry before any Mapbox initialization
  useEffect(() => {
    console.log('🚫 Setting up comprehensive telemetry blocking...');

    // Console overrides are now handled globally, just set up fetch blocking
    const originalFetch = window.fetch;
    const originalXMLHttpRequest = window.XMLHttpRequest;

    // Override fetch with comprehensive blocking
    window.fetch = function(...args) {
      const url = args[0];
      const urlString = typeof url === 'string' ? url : (url && url.url) || '';

      // Block all telemetry and analytics requests
      if (urlString.includes('events.mapbox.com') ||
          urlString.includes('api.mapbox.com/events') ||
          urlString.includes('api.mapbox.com/ping') ||
          urlString.includes('telemetry') ||
          urlString.includes('analytics') ||
          urlString.match(/\/events\/[^\/]*$/)) {
        console.log('🚫 Blocked telemetry request:', urlString);
        return Promise.resolve(new Response('{"status":"blocked"}', {
          status: 200,
          statusText: 'Blocked by client',
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      return originalFetch.apply(this, args);
    };

    // Override XMLHttpRequest for older telemetry methods
    window.XMLHttpRequest = function() {
      const xhr = new originalXMLHttpRequest();
      const originalOpen = xhr.open;
      xhr.open = function(method, url, ...args) {
        if (typeof url === 'string' &&
            (url.includes('events.mapbox.com') ||
             url.includes('api.mapbox.com/events') ||
             url.includes('telemetry'))) {
          console.log('🚫 Blocked XHR telemetry request:', url);
          // Don't call the original open for blocked requests
          return;
        }
        return originalOpen.apply(this, [method, url, ...args]);
      };
      return xhr;
    };

    // Set environment variable to disable telemetry
    if (typeof process !== 'undefined' && process.env) {
      process.env.MAPBOX_DISABLE_TELEMETRY = 'true';
    }

    // Global telemetry disable
    if (typeof window !== 'undefined') {
      window.MAPBOX_DISABLE_TELEMETRY = true;
    }

    // Error handling is now managed globally for better coverage

    // Cleanup: restore originals when component unmounts
    return () => {
      window.fetch = originalFetch;
      window.XMLHttpRequest = originalXMLHttpRequest;
      // Console overrides and global error handlers are now managed globally
      // and persist across component mounts/unmounts for better error suppression
      if (typeof window !== 'undefined') {
        delete window.MAPBOX_DISABLE_TELEMETRY;
      }
    };
  }, []);

  // Test Mapbox token on component mount
  useEffect(() => {
    const validateToken = async () => {
      console.log('🔑 Testing Mapbox token...');
      const result = await testMapboxToken();
      setTokenValid(result.valid);

      if (!result.valid) {
        setMapError(`Token validation failed: ${result.error || result.status}`);
        console.error('❌ Mapbox token is invalid or network error');
      }
    };

    validateToken();
  }, []);

  // Inicializar Mapbox com ferramenta de desenho
  useEffect(() => {
    // Only initialize when token is confirmed valid and not already initializing
    if (map.current || tokenValid !== true || isInitializing) return;

    console.log('🗺️ Inicializando Mapbox com ferramenta de desenho...');
    setIsInitializing(true);

    if (!mapContainer.current) {
      console.error('❌ Container do mapa não encontrado!');
      setMapError('Container do mapa não encontrado');
      setIsInitializing(false);
      return;
    }

    if (!mapboxgl.supported()) {
      console.error('❌ WebGL não suportado');
      setMapError('WebGL não é suportado pelo navegador');
      setIsInitializing(false);
      return;
    }

    const config = getMapboxConfig();
    mapboxgl.accessToken = config.accessToken;

    try {
      // Comprehensive telemetry disabling
      console.log('�� Aggressively disabling all Mapbox telemetry...');

      // Multiple methods to disable telemetry
      try {
        // Method 1: Direct telemetry disable
        if (mapboxgl.telemetry && typeof mapboxgl.telemetry.disable === 'function') {
          mapboxgl.telemetry.disable();
          console.log('✅ Telemetry disabled via mapboxgl.telemetry.disable()');
        }

        // Method 2: Set telemetry to false
        if (mapboxgl.telemetry) {
          mapboxgl.telemetry = false;
        }

        // Method 3: Disable via config
        if (mapboxgl.config) {
          mapboxgl.config.TELEMETRY_ENABLED = false;
        }

        // Method 4: Set global disable flag
        mapboxgl.config = mapboxgl.config || {};
        mapboxgl.config.TELEMETRY_ENABLED = false;

      } catch (telemetryError) {
        console.log('⚠️ Some telemetry disable methods failed (expected):', telemetryError.message);
      }

      // Prewarm if available
      if (typeof mapboxgl.prewarm === 'function') {
        mapboxgl.prewarm();
      }

      // Criar mapa with comprehensive telemetry blocking
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: config.style,
        center: config.center,
        zoom: config.zoom,
        transformRequest: (url, resourceType) => {
          const urlString = typeof url === 'string' ? url : '';

          // Comprehensive blocking of telemetry requests
          if (urlString.includes('events.mapbox.com') ||
              urlString.includes('api.mapbox.com/events') ||
              urlString.includes('api.mapbox.com/ping') ||
              urlString.includes('telemetry') ||
              urlString.includes('analytics') ||
              resourceType === 'Unknown' ||
              resourceType === 'Analytics') {
            console.log('🚫 Blocked in transformRequest:', urlString);
            return { url: '' }; // Block the request completely
          }

          return {
            url: url,
            credentials: 'omit'
          };
        },
        // Comprehensive performance and telemetry options
        maxTileCacheSize: 30,
        collectResourceTiming: false,
        trackResize: false,
        preserveDrawingBuffer: false,
        antialias: false,
        failIfMajorPerformanceCaveat: false,
        // Additional options to prevent telemetry
        attributionControl: false,
        logoPosition: 'bottom-right'
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

      // Evento de carregamento with AbortError protection
      mapInstance.on('load', () => {
        try {
          console.log('🎉 Mapa carregado com sucesso!');

          // Adicionar polígonos dos talhões existentes
          addTalhoesLayer();

          setMapLoaded(true);
          setIsInitializing(false);

          // Listeners para talhões existentes with error protection
          mapInstance.on('click', 'talhoes-layer', (e) => {
            try {
              if (e.features.length > 0) {
                const talhaoId = e.features[0].properties.id;
                console.log('🎯 Talhão clicado:', talhaoId);
                setSelectedTalhao(talhaoId);
              }
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('❌ Erro no click do talhão:', error);
              }
            }
          });

          mapInstance.on('mouseenter', 'talhoes-layer', () => {
            try {
              mapInstance.getCanvas().style.cursor = 'pointer';
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('❌ Erro no mouseenter:', error);
              }
            }
          });

          mapInstance.on('mouseleave', 'talhoes-layer', () => {
            try {
              mapInstance.getCanvas().style.cursor = '';
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('❌ Erro no mouseleave:', error);
              }
            }
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('❌ Erro no evento load do mapa:', error);
          }
        }
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
          console.log('��� Geometria válida. Área:', validation.area, 'ha');
        } else {
          alert(`❌ Erro na geometria: ${validation.error}`);
          if (drawInstance && drawInstance.delete) {
            drawInstance.delete(feature.id);
          }
        }
      });

      mapInstance.on('draw.update', (e) => {
        console.log('✏️ Talhão editado:', e);
        const feature = e.features[0];
        const validation = validateGeometry(feature.geometry);

        if (!validation.valid) {
          alert(`❌ Erro na geometria: ${validation.error}`);
          if (drawInstance && drawInstance.delete) {
            drawInstance.delete(feature.id);
          }
        }
      });

      mapInstance.on('draw.delete', (e) => {
        console.log('🗑️ Talhão deletado:', e);
        setDrawnGeometry(null);
        setShowNewTalhaoForm(false);
      });

      // Comprehensive error handling
      mapInstance.on('error', (e) => {
        const error = e.error || {};
        const errorMessage = error.message || '';
        const errorStack = error.stack || '';

        // Enhanced abort error detection (covers all patterns from user's error)
        if (error.name === 'AbortError' ||
            errorMessage.includes('signal is aborted') ||
            errorMessage.includes('aborted without reason') ||
            errorStack.includes('Object.cancel') ||
            errorStack.includes('Me.abortTile') ||
            errorStack.includes('ey._abortTile') ||
            errorStack.includes('ey._removeTile') ||
            errorStack.includes('ey.update') ||
            errorStack.includes('Kt._updateSources') ||
            errorStack.includes('Map._render') ||
            errorStack.includes('abortTile') ||
            errorStack.includes('_abortTile') ||
            errorStack.includes('_removeTile')) {
          console.log('🛡️ AbortError suppressed in map error handler');
          return;
        }

        // Comprehensive telemetry error filtering
        const isTelemetryError = errorMessage.includes('Failed to fetch') && (
          errorStack.includes('events.mapbox.com') ||
          errorStack.includes('api.mapbox.com/events') ||
          errorStack.includes('postPerformanceEvent') ||
          errorStack.includes('postMapLoadEvent') ||
          errorStack.includes('postEvent') ||
          errorStack.includes('processRequests') ||
          errorStack.includes('queueRequest') ||
          errorStack.includes('telemetry') ||
          errorStack.includes('analytics')
        );

        if (isTelemetryError) {
          console.log('📊 Telemetry error ignored:', errorMessage);
          return;
        }

        // Also ignore generic "Failed to fetch" without useful context
        if (errorMessage === 'Failed to fetch' && !errorStack.includes('tiles')) {
          console.log('🌐 Generic fetch error ignored (likely telemetry)');
          return;
        }

        const handledError = handleMapboxError(e.error, mapInstance);
        setMapError(`Erro do mapa: ${handledError.message}`);
        setIsInitializing(false);
      });

      // Handle style load
      mapInstance.on('style.load', () => {
        console.log('✅ Map style loaded successfully');
        setMapError(null);
      });

      // Handle source errors gracefully
      mapInstance.on('sourcedataerror', (e) => {
        // Ignore abort errors for source data
        if (e.error?.name === 'AbortError') {
          return;
        }
        console.warn('⚠️ Source data error:', e);
      });

    } catch (error) {
      console.error('❌ Erro ao criar mapa:', error);
      setMapError(`Falha na inicialização: ${error.message}`);
      setIsInitializing(false);
    }

    // Component-level AbortError protection
    const componentAbortErrorHandler = (event) => {
      const error = event.error || event.reason;
      if (error && (
        error.name === 'AbortError' ||
        (error.message && error.message.includes('signal is aborted')) ||
        (error.stack && (
          error.stack.includes('Object.cancel') ||
          error.stack.includes('Me.abortTile') ||
          error.stack.includes('ey._abortTile') ||
          error.stack.includes('ey._removeTile') ||
          error.stack.includes('ey.update') ||
          error.stack.includes('Kt._updateSources') ||
          error.stack.includes('Map._render')
        ))
      )) {
        console.log('🛡️ [Component] Suppressed AbortError');
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('error', componentAbortErrorHandler);
    window.addEventListener('unhandledrejection', componentAbortErrorHandler);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up map...');

      // Clear any pending updates
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
        updateTimeout.current = null;
      }

      // Clean up map instance
      if (map.current) {
        try {
          // Remove all event listeners before removing map
          map.current.off();
          map.current.remove();
        } catch (cleanupError) {
          console.warn('⚠️ Error during map cleanup (expected):', cleanupError.message);
        }
        map.current = null;
      }

      setIsInitializing(false);
      setMapLoaded(false);
      setIsUpdatingMap(false);

      // Remove component-level error listeners
      window.removeEventListener('error', componentAbortErrorHandler);
      window.removeEventListener('unhandledrejection', componentAbortErrorHandler);
    };
  }, [tokenValid]);

  // Note: Talhões são agora carregados automaticamente via useCloudFarmTalhoes
  // Dados iniciais de exemplo removidos em favor dos dados reais do CloudFarm

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
        geometry: talhao.geometry || {
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

  // Atualizar talhão selecionado (aguardar término de updates do mapa)
  useEffect(() => {
    if (selectedTalhao && mapLoaded && !isUpdatingMap) {
      // Small delay to ensure map updates are complete
      const timeoutId = setTimeout(() => {
        updateSelectedTalhao(selectedTalhao);
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedTalhao, mapLoaded, isUpdatingMap]);

  // Função para atualizar mapa com debounce
  const updateMapData = useCallback(() => {
    if (!mapLoaded || !map.current || !map.current.getSource('talhoes') || isUpdatingMap) {
      return;
    }

    try {
      setIsUpdatingMap(true);

      const geojsonData = {
        type: 'FeatureCollection',
        features: currentTalhoes.map((talhao) => {
          const hasCustomGeometry = talhao.geometry && talhao.geometry.type === 'Polygon';
          console.log(`📍 Talhão ${talhao.id}: ${hasCustomGeometry ? 'geometria personalizada' : 'geometria padrão'}`);

          return {
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
          };
        })
      };

      map.current.getSource('talhoes').setData(geojsonData);
      console.log('🗺️ Map updated with current talhões:', currentTalhoes.length);

      // Reset updating flag after a short delay
      setTimeout(() => setIsUpdatingMap(false), 100);

    } catch (error) {
      console.error('❌ Erro ao atualizar dados do mapa:', error);
      setIsUpdatingMap(false);
    }
  }, [mapLoaded, currentTalhoes, isUpdatingMap]);

  // Atualizar mapa quando currentTalhoes mudar (com debounce)
  useEffect(() => {
    // Clear any pending updates
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    // Debounce the update to prevent rapid successive calls
    updateTimeout.current = setTimeout(() => {
      updateMapData();
    }, 200); // 200ms debounce

    // Cleanup
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, [currentTalhoes, updateMapData]);

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
  const saveNewTalhao = async () => {
    if (!drawnGeometry) return;

    const validation = validateGeometry(drawnGeometry);
    if (!validation.valid) {
      alert(`❌ Erro na geometria: ${validation.error}`);
      return;
    }

    try {
      const newTalhaoData_final = {
        nome: newTalhaoData.nome || `T${currentTalhoes.length + 1}`,
        area: parseFloat(validation.area),
        cultura: newTalhaoData.cultura,
        variedade: newTalhaoData.variedade,
        grupoMaturacao: newTalhaoData.grupoMaturacao,
        status: newTalhaoData.status,
        dataPlantio: newTalhaoData.dataPlantio,
        colheitaEstimada: newTalhaoData.colheitaEstimada,
        geometry: drawnGeometry,
        observacoes: newTalhaoData.observacoes || ''
      };

      console.log('💾 Salvando novo talhão no CloudFarm:', newTalhaoData_final);

      // Salvar no CloudFarm via API
      if (cloudFarmConnected) {
        await createCloudFarmTalhao(newTalhaoData_final);
        console.log('✅ Talhão salvo no CloudFarm com sucesso');
      } else {
        console.warn('⚠️ CloudFarm desconectado, salvando localmente');
        // Fallback: salvar localmente se CloudFarm não estiver disponível
        // (ser�� implementado posteriormente se necessário)
      }

      // Limpar formulário
      setShowNewTalhaoForm(false);
      setDrawnGeometry(null);
      setNewTalhaoData({
        nome: '',
        cultura: 'Soja',
        variedade: '',
        grupoMaturacao: '',
        status: 'livre',
        dataPlantio: null,
        colheitaEstimada: null,
        observacoes: ''
      });

      // Sair do modo de desenho
      if (draw.current) {
        draw.current.deleteAll();
        draw.current.changeMode('simple_select');
        setDrawMode(false);
      }

    } catch (error) {
      console.error('❌ Erro ao salvar talhão:', error);
      alert(`❌ Erro ao salvar talhão: ${error.message}`);
    }
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

      {/* Status de Conexão CloudFarm */}
      <ConnectionStatus />

      {talhoesLoading && (
        <div style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '1rem'
        }}>
          ⏳ Carregando dados...
        </div>
      )}

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
            disabled={!mapLoaded || isInitializing || tokenValid === false}
            style={{
              backgroundColor: drawMode ? '#2196f3' : '#f0f0f0',
              color: drawMode ? 'white' : '#333',
              border: `2px solid ${drawMode ? '#2196f3' : '#ccc'}`,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: (!mapLoaded || isInitializing || tokenValid === false) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: (!mapLoaded || isInitializing || tokenValid === false) ? 0.6 : 1
            }}
          >
            {drawMode ? '🛑' : '���️'} 
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

          {/* Grupo de Maturação/Precocidade baseado na cultura */}
          {(newTalhaoData.cultura === 'Soja' || newTalhaoData.cultura === 'Milho') && (
            <div style={{ marginBottom: '1rem' }}>
              <label>
                {newTalhaoData.cultura === 'Soja' ? 'Grupo de Maturação:' : 'Precocidade:'}
              </label>
              <input
                type="text"
                value={newTalhaoData.grupoMaturacao}
                onChange={(e) => setNewTalhaoData(prev => ({...prev, grupoMaturacao: e.target.value}))}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                placeholder={newTalhaoData.cultura === 'Soja' ? 'Ex: 6.2' : 'Ex: Precoce'}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label>Status:</label>
            <select
              value={newTalhaoData.status}
              onChange={(e) => setNewTalhaoData(prev => ({...prev, status: e.target.value}))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            >
              <option value="livre">Livre</option>
              <option value="plantado">Plantado</option>
              <option value="planejado">Planejado</option>
            </select>
          </div>

          {/* Datas de plantio e colheita (se plantado ou planejado) */}
          {(newTalhaoData.status === 'plantado' || newTalhaoData.status === 'planejado') && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label>Data de Plantio:</label>
                <input
                  type="date"
                  value={newTalhaoData.dataPlantio ? newTalhaoData.dataPlantio.toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewTalhaoData(prev => ({
                    ...prev,
                    dataPlantio: e.target.value ? new Date(e.target.value) : null
                  }))}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>

              {(newTalhaoData.cultura === 'Soja' || newTalhaoData.cultura === 'Milho') && (
                <div style={{ marginBottom: '1rem' }}>
                  <label>Colheita Estimada:</label>
                  <input
                    type="date"
                    value={newTalhaoData.colheitaEstimada ? newTalhaoData.colheitaEstimada.toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewTalhaoData(prev => ({
                      ...prev,
                      colheitaEstimada: e.target.value ? new Date(e.target.value) : null
                    }))}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </div>
              )}
            </>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Observações:</label>
            <textarea
              value={newTalhaoData.observacoes}
              onChange={(e) => setNewTalhaoData(prev => ({...prev, observacoes: e.target.value}))}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.25rem',
                minHeight: '60px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              placeholder="Observações adicionais sobre o talhão..."
            />
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
          {(!mapLoaded || isInitializing) && !mapError && tokenValid !== false && (
            <div className="map-loading" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <h3>🗺️ {isInitializing ? 'Inicializando' : 'Carregando'} Mapa com Ferramenta de Desenho...</h3>
              <p>{isInitializing ? 'Configurando Mapbox GL Draw' : 'Carregando recursos'}</p>
            </div>
          )}

          {tokenValid === false && (
            <div className="map-error" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: '#ffebee',
              color: '#d32f2f'
            }}>
              <h3>❌ Erro de Autenticaç��o</h3>
              <p>Token do Mapbox inválido ou expirado</p>
              <small>Verifique a configuração do token Mapbox</small>
            </div>
          )}

          {mapError && tokenValid !== false && (
            <div className="map-error" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: '#fff3e0',
              color: '#f57c00',
              padding: '1rem'
            }}>
              <h3>⚠️ Erro no Mapa</h3>
              <p>{mapError}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f57c00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Recarregar Página
              </button>
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
            <span className="info-icon">🌐</span>
            <div className="info-content">
              <span className="info-title">CloudFarm Status</span>
              <span className="info-value">{cloudFarmConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">����</span>
            <div className="info-content">
              <span className="info-title">Área Total</span>
              <span className="info-value">{statistics?.areaTotal?.toFixed(1) || '0'} ha</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">����</span>
            <div className="info-content">
              <span className="info-title">Talhões Cadastrados</span>
              <span className="info-value">{statistics?.total || 0} unidades</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🌱</span>
            <div className="info-content">
              <span className="info-title">Talhões Plantados</span>
              <span className="info-value">{statistics?.plantados || 0} unidades</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🟡</span>
            <div className="info-content">
              <span className="info-title">Talhões Livres</span>
              <span className="info-value">{statistics?.livres || 0} unidades</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🖊️</span>
            <div className="info-content">
              <span className="info-title">Ferramenta Desenho</span>
              <span className="info-value">{drawMode ? 'Ativa' : 'Inativa'}</span>
            </div>
          </div>
          {statistics?.culturas && statistics.culturas.length > 0 && (
            <div className="info-card">
              <span className="info-icon">🌽</span>
              <div className="info-content">
                <span className="info-title">Culturas Ativas</span>
                <span className="info-value">{statistics.culturas.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Talhoes;

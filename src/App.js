import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthLoadingScreen } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Talhoes from './pages/Talhoes';
import Estoque from './pages/Estoque';
import Equipe from './pages/Equipe';
import Configuracoes from './pages/Configuracoes';
import MapTest from './pages/MapTest';
import MapTestSimple from './pages/MapTestSimple';
import MapTestBasic from './pages/MapTestBasic';
import MapTestFinal from './pages/MapTestFinal';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

// 🚫 GLOBAL ABORT ERROR SUPPRESSION - Early Application Level
if (typeof window !== 'undefined' && !window.__APP_ABORT_ERROR_SUPPRESSED__) {
  console.log('🛡️ [APP] Setting up global AbortError suppression...');

  // Store originals
  const _originalConsoleError = console.error;
  const _originalConsoleWarn = console.warn;
  const _originalWindowOnError = window.onerror;

  // Enhanced error detection patterns
  const ABORT_ERROR_PATTERNS = [
    'AbortError',
    'signal is aborted',
    'Object.cancel',
    'Me.abortTile',
    'ey._abortTile',
    'ey._removeTile',
    'ey.update',
    'Kt._updateSources',
    'Map._render',
    'abortTile',
    'The operation was aborted',
    'Request aborted',
    'signal aborted'
  ];

  const isAbortError = (input) => {
    if (!input) return false;

    // Check error object
    if (typeof input === 'object') {
      if (input.name === 'AbortError') return true;
      if (input.message && ABORT_ERROR_PATTERNS.some(pattern =>
        input.message.toString().includes(pattern))) return true;
      if (input.stack && ABORT_ERROR_PATTERNS.some(pattern =>
        input.stack.toString().includes(pattern))) return true;
    }

    // Check string
    const str = input.toString();
    return ABORT_ERROR_PATTERNS.some(pattern => str.includes(pattern));
  };

  // Override console.error
  console.error = function(...args) {
    if (args.some(arg => isAbortError(arg))) {
      console.log('🛡️ [APP] Suppressed AbortError in console.error');
      return;
    }
    return _originalConsoleError.apply(this, args);
  };

  // Override console.warn
  console.warn = function(...args) {
    if (args.some(arg => isAbortError(arg))) {
      console.log('🛡️ [APP] Suppressed AbortError in console.warn');
      return;
    }
    return _originalConsoleWarn.apply(this, args);
  };

  // Override window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    if (isAbortError(message) || isAbortError(error)) {
      console.log('🛡️ [APP] Suppressed AbortError in window.onerror');
      return true;
    }

    if (_originalWindowOnError) {
      return _originalWindowOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isAbortError(event.reason)) {
      console.log('🛡️ [APP] Suppressed AbortError in unhandledrejection');
      event.preventDefault();
      return;
    }
  });

  // Global error events
  window.addEventListener('error', (event) => {
    if (isAbortError(event.error) || isAbortError(event.message)) {
      console.log('🛡️ [APP] Suppressed AbortError in global error event');
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Intercept fetch AbortErrors specifically
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
      if (isAbortError(error)) {
        console.log('🛡️ [APP] Suppressed AbortError in fetch');
        return Promise.reject(new Error('Network request failed')); // Generic error
      }
      return Promise.reject(error);
    });
  };

  window.__APP_ABORT_ERROR_SUPPRESSED__ = true;
  console.log('✅ [APP] Global AbortError suppression active');
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthLoadingScreen>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="logs" element={<Logs />} />
                <Route path="talhoes" element={<Talhoes />} />
                <Route path="maptest" element={<MapTest />} />
                <Route path="mapsimple" element={<MapTestSimple />} />
                <Route path="mapbasic" element={<MapTestBasic />} />
                <Route path="mapfinal" element={<MapTestFinal />} />
                <Route path="estoque" element={<Estoque />} />
                <Route path="equipe" element={<Equipe />} />
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>
            </Routes>
          </Router>
        </AuthLoadingScreen>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

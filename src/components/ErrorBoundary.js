import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's an AbortError and suppress it
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
      console.log('🛡️ [ErrorBoundary] Suppressed AbortError in React render');
      return { hasError: false, error: null }; // Don't show error UI for AbortError
    }

    // For other errors, show error UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Check if it's an AbortError and suppress it
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
      console.log('🛡️ [ErrorBoundary] Caught and suppressed AbortError:', error.message);
      this.setState({ hasError: false, error: null });
      return;
    }

    // Log other errors normally
    console.error('❌ [ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          margin: '1rem'
        }}>
          <h2>🚨 Algo deu errado</h2>
          <p>Ocorreu um erro inesperado. Tente recarregar a página.</p>
          <details style={{ marginTop: '1rem' }}>
            <summary>Detalhes do erro</summary>
            <pre style={{ 
              fontSize: '0.8rem', 
              overflow: 'auto',
              padding: '0.5rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              marginTop: '0.5rem'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

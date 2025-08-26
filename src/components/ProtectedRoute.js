import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import '../styles/auth.css';

const ProtectedRoute = ({ 
  children, 
  requireRoles = [], 
  fallback = null,
  showLoginModal = true,
  redirectTo = null 
}) => {
  const { isAuthenticated, isChecking, user, hasRole, isLoggingIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Ainda verificando autenticação
  if (isChecking) {
    return (
      <div className="auth-loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    if (showLoginModal) {
      return (
        <>
          <div className="protected-route-overlay">
            <div className="protected-route-content">
              <h2>🔒 Acesso Restrito</h2>
              <p>Você precisa estar logado para acessar esta página.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="login-button"
                disabled={isLoggingIn}
              >
                Fazer Login
              </button>
            </div>
          </div>
          
          <LoginModal 
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => setShowModal(false)}
          />
        </>
      );
    }

    if (fallback) {
      return fallback;
    }

    // Renderizar mensagem padrão
    return (
      <div className="auth-required-message">
        <h3>Acesso Restrito</h3>
        <p>Você precisa estar logado para acessar esta página.</p>
        {redirectTo && (
          <p>
            <a href={redirectTo}>Ir para a página de login</a>
          </p>
        )}
      </div>
    );
  }

  // Verificar roles se especificadas
  if (requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      const userRoles = user?.roles || [];
      
      return (
        <div className="protected-route-overlay">
          <div className="protected-route-content">
            <h2>🚫 Acesso Negado</h2>
            <p>Você não tem permissão para acessar esta página.</p>
            <div style={{ marginTop: '1rem', fontSize: '14px', color: '#6c757d' }}>
              <p><strong>Permissões necessárias:</strong> {requireRoles.join(', ')}</p>
              <p><strong>Suas permissões:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'Nenhuma'}</p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Usuário autenticado e com permissões corretas
  return children;
};

// Componente para exigir autenticação específica por role
export const RequireRole = ({ children, roles = [], fallback = null }) => {
  const { hasRole, user } = useAuth();
  
  const hasRequiredRole = roles.some(role => hasRole(role));
  
  if (!hasRequiredRole) {
    if (fallback) {
      return fallback;
    }
    
    const userRoles = user?.roles || [];
    
    return (
      <div className="auth-required-message">
        <h3>Permissão Insuficiente</h3>
        <p>Você não tem permissão para acessar este conteúdo.</p>
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>
          <p><strong>Necessário:</strong> {roles.join(' ou ')}</p>
          <p><strong>Seu nível:</strong> {userRoles.join(', ') || 'Nenhum'}</p>
        </div>
      </div>
    );
  }
  
  return children;
};

// Componente para verificar se é admin
export const RequireAdmin = ({ children, fallback = null }) => {
  return (
    <RequireRole roles={['admin']} fallback={fallback}>
      {children}
    </RequireRole>
  );
};

// Hook para verificar se pode acessar baseado em roles
export const useCanAccess = (requiredRoles = []) => {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return false;
  }
  
  if (requiredRoles.length === 0) {
    return true;
  }
  
  return requiredRoles.some(role => hasRole(role));
};

// Componente de loading para páginas protegidas
export const AuthLoadingWrapper = ({ children, loadingComponent = null }) => {
  const { isChecking } = useAuth();
  
  if (isChecking) {
    if (loadingComponent) {
      return loadingComponent;
    }
    
    return (
      <div className="auth-loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  return children;
};

// Componente para conteúdo condicional baseado em autenticação
export const AuthConditional = ({ 
  children, 
  fallback = null, 
  requireRoles = [], 
  requireAuth = true 
}) => {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (requireAuth && !isAuthenticated) {
    return fallback;
  }
  
  if (requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return fallback;
    }
  }
  
  return children;
};

export default ProtectedRoute;

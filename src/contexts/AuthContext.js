import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// Estados de autenticação
const AUTH_STATES = {
  CHECKING: 'CHECKING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  LOGGING_IN: 'LOGGING_IN',
  LOGGING_OUT: 'LOGGING_OUT',
  ERROR: 'ERROR'
};

// Actions do reducer
const AUTH_ACTIONS = {
  SET_CHECKING: 'SET_CHECKING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  SET_LOGGING_IN: 'SET_LOGGING_IN',
  SET_LOGGING_OUT: 'SET_LOGGING_OUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Estado inicial
const initialState = {
  authState: AUTH_STATES.CHECKING,
  user: null,
  token: null,
  error: null,
  isAuthenticated: false,
  isLoading: false
};

// Reducer para gerenciar estado de autenticação
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_CHECKING:
      return {
        ...state,
        authState: AUTH_STATES.CHECKING,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        authState: AUTH_STATES.AUTHENTICATED,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_UNAUTHENTICATED:
      return {
        ...state,
        authState: AUTH_STATES.UNAUTHENTICATED,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_LOGGING_IN:
      return {
        ...state,
        authState: AUTH_STATES.LOGGING_IN,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.SET_LOGGING_OUT:
      return {
        ...state,
        authState: AUTH_STATES.LOGGING_OUT,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        authState: AUTH_STATES.ERROR,
        error: action.payload.error,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Criar o Context
const AuthContext = createContext(null);

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticação inicial
  useEffect(() => {
    checkInitialAuth();
  }, []);

  /**
   * Verifica se existe uma sessão válida ao carregar a aplicação
   */
  const checkInitialAuth = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_CHECKING });

    try {
      if (authService.isAuthenticated()) {
        // Token válido encontrado, obter dados atualizados do usuário
        try {
          const user = await authService.getCurrentUserFromServer();
          const token = authService.getToken();
          
          dispatch({
            type: AUTH_ACTIONS.SET_AUTHENTICATED,
            payload: { user, token }
          });
        } catch (error) {
          // Se falhar ao obter dados do servidor, usar dados locais
          const user = authService.getUser();
          const token = authService.getToken();
          
          if (user && token) {
            dispatch({
              type: AUTH_ACTIONS.SET_AUTHENTICATED,
              payload: { user, token }
            });
          } else {
            // Limpar dados corrompidos
            authService.clearAuthData();
            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
          }
        }
      } else {
        // Não há sessão válida
        authService.clearAuthData();
        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação inicial:', error);
      authService.clearAuthData();
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    }
  };

  /**
   * Realiza login
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOGGING_IN });

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.SET_AUTHENTICATED,
          payload: {
            user: result.user,
            token: result.token
          }
        });

        return { success: true, user: result.user };
      } else {
        throw new Error('Login falhou');
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao fazer login';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: errorMessage }
      });

      // Após um tempo, voltar para unauthenticated
      setTimeout(() => {
        dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      }, 3000);

      throw error;
    }
  }, []);

  /**
   * Realiza logout
   */
  const logout = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOGGING_OUT });

    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, fazer logout local
      dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    }
  }, []);

  /**
   * Renova o token
   */
  const refreshToken = useCallback(async () => {
    try {
      const newToken = await authService.refreshToken();
      const user = authService.getUser();

      dispatch({
        type: AUTH_ACTIONS.SET_AUTHENTICATED,
        payload: { user, token: newToken }
      });

      return newToken;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Se falhar, fazer logout
      await logout();
      throw error;
    }
  }, [logout]);

  /**
   * Atualiza dados do usuário
   */
  const updateUser = async () => {
    try {
      const user = await authService.getCurrentUserFromServer();
      const token = authService.getToken();
      
      dispatch({
        type: AUTH_ACTIONS.SET_AUTHENTICATED,
        payload: { user, token }
      });
      
      return user;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  /**
   * Limpa erro atual
   */
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Verifica se o usuário tem uma role específica
   * @param {string} role
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return state.user && state.user.roles && state.user.roles.includes(role);
  };

  /**
   * Verifica se o usuário é admin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Valores e funções disponíveis no contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Estados derivados
    isChecking: state.authState === AUTH_STATES.CHECKING,
    isLoggingIn: state.authState === AUTH_STATES.LOGGING_IN,
    isLoggingOut: state.authState === AUTH_STATES.LOGGING_OUT,
    hasError: state.authState === AUTH_STATES.ERROR,
    
    // Funções
    login,
    logout,
    refreshToken,
    updateUser,
    clearError,
    hasRole,
    isAdmin,
    
    // Constantes úteis
    AUTH_STATES
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// Hook para verificar se está autenticado
export const useAuthRequired = () => {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isChecking && !auth.isAuthenticated) {
      // Redirecionar para login ou mostrar modal
      console.warn('Usuário não autenticado em página protegida');
    }
  }, [auth.isChecking, auth.isAuthenticated]);
  
  return auth;
};

// Componente para mostrar loading durante verificação inicial
export const AuthLoadingScreen = ({ children }) => {
  const { isChecking } = useAuth();
  
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
  
  return children;
};

export default AuthContext;

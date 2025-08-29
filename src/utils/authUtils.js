import authService from '../services/authService';

/**
 * Utilitários para autenticação
 */

// Constantes de roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
  OPERATOR: 'operator'
};

// Constantes de permissões
export const PERMISSIONS = {
  VIEW_TALHOES: 'view_talhoes',
  CREATE_TALHOES: 'create_talhoes',
  EDIT_TALHOES: 'edit_talhoes',
  DELETE_TALHOES: 'delete_talhoes',
  VIEW_STATISTICS: 'view_statistics',
  MANAGE_USERS: 'manage_users',
  ADMIN_ACCESS: 'admin_access'
};

// Mapeamento de roles para permissões
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_TALHOES,
    PERMISSIONS.CREATE_TALHOES,
    PERMISSIONS.EDIT_TALHOES,
    PERMISSIONS.DELETE_TALHOES,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ADMIN_ACCESS
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_TALHOES,
    PERMISSIONS.CREATE_TALHOES,
    PERMISSIONS.EDIT_TALHOES,
    PERMISSIONS.DELETE_TALHOES,
    PERMISSIONS.VIEW_STATISTICS
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_TALHOES,
    PERMISSIONS.CREATE_TALHOES,
    PERMISSIONS.EDIT_TALHOES,
    PERMISSIONS.VIEW_STATISTICS
  ],
  [ROLES.OPERATOR]: [
    PERMISSIONS.VIEW_TALHOES,
    PERMISSIONS.VIEW_STATISTICS
  ]
};

/**
 * Verifica se o usuário atual tem uma permissão específica
 * @param {string} permission - Permissão a verificar
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  const user = authService.getUser();
  
  if (!user || !user.roles) {
    return false;
  }
  
  return user.roles.some(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
  });
};

/**
 * Verifica se o usuário atual pode visualizar talhões
 * @returns {boolean}
 */
export const canViewTalhoes = () => {
  return hasPermission(PERMISSIONS.VIEW_TALHOES);
};

/**
 * Verifica se o usuário atual pode criar talhões
 * @returns {boolean}
 */
export const canCreateTalhoes = () => {
  return hasPermission(PERMISSIONS.CREATE_TALHOES);
};

/**
 * Verifica se o usuário atual pode editar talhões
 * @returns {boolean}
 */
export const canEditTalhoes = () => {
  return hasPermission(PERMISSIONS.EDIT_TALHOES);
};

/**
 * Verifica se o usuário atual pode deletar talhões
 * @returns {boolean}
 */
export const canDeleteTalhoes = () => {
  return hasPermission(PERMISSIONS.DELETE_TALHOES);
};

/**
 * Verifica se o usuário atual pode ver estatísticas
 * @returns {boolean}
 */
export const canViewStatistics = () => {
  return hasPermission(PERMISSIONS.VIEW_STATISTICS);
};

/**
 * Verifica se o usuário atual pode gerenciar usuários
 * @returns {boolean}
 */
export const canManageUsers = () => {
  return hasPermission(PERMISSIONS.MANAGE_USERS);
};

/**
 * Verifica se o usuário atual tem acesso de admin
 * @returns {boolean}
 */
export const hasAdminAccess = () => {
  return hasPermission(PERMISSIONS.ADMIN_ACCESS);
};

/**
 * Obtém todas as permissões do usuário atual
 * @returns {string[]}
 */
export const getUserPermissions = () => {
  const user = authService.getUser();
  
  if (!user || !user.roles) {
    return [];
  }
  
  const allPermissions = new Set();
  
  user.roles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });
  
  return Array.from(allPermissions);
};

/**
 * Verifica se o token está próximo do vencimento
 * @param {number} minutesThreshold - Minutos antes do vencimento para considerar "próximo"
 * @returns {boolean}
 */
export const isTokenNearExpiry = (minutesThreshold = 10) => {
  const token = authService.getToken();
  
  if (!token) {
    return true;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - currentTime;
    
    return timeUntilExpiry <= (minutesThreshold * 60);
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error);
    return true;
  }
};

/**
 * Obtém o tempo restante até a expiração do token em segundos
 * @returns {number|null}
 */
export const getTokenTimeToExpiry = () => {
  const token = authService.getToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    console.error('Erro ao calcular tempo de expiração:', error);
    return null;
  }
};

/**
 * Formata informações do usuário para exibição
 * @param {Object} user - Objeto do usuário
 * @returns {Object}
 */
export const formatUserInfo = (user) => {
  if (!user) {
    return null;
  }
  
  return {
    name: user.name || 'Usuário',
    email: user.email || '',
    initials: getUserInitials(user.name),
    roles: (user.roles || []).map(role => ROLE_NAMES[role] || role),
    farmName: user.farm_name || '',
    farmId: user.farm_id || '',
    isAdmin: (user.roles || []).includes(ROLES.ADMIN)
  };
};

// Nomes amigáveis para roles
export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.MANAGER]: 'Gerente',
  [ROLES.USER]: 'Usuário',
  [ROLES.OPERATOR]: 'Operador'
};

/**
 * Obtém as iniciais do nome do usuário
 * @param {string} name - Nome completo
 * @returns {string}
 */
export const getUserInitials = (name) => {
  if (!name) return '?';
  
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

/**
 * Valida formato de email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida força da senha
 * @param {string} password
 * @returns {Object}
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    errors: []
  };
  
  if (!password) {
    result.errors.push('Senha é obrigatória');
    return result;
  }
  
  if (password.length < 6) {
    result.errors.push('Senha deve ter pelo menos 6 caracteres');
  } else {
    result.score += 1;
  }
  
  if (password.length >= 8) {
    result.score += 1;
  }
  
  if (/[a-z]/.test(password)) {
    result.score += 1;
  }
  
  if (/[A-Z]/.test(password)) {
    result.score += 1;
  }
  
  if (/[0-9]/.test(password)) {
    result.score += 1;
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    result.score += 1;
  }
  
  result.isValid = result.errors.length === 0 && result.score >= 2;
  
  return result;
};

/**
 * Wrapper para requisições autenticadas com retry automático
 * @param {Function} requestFn - Função que faz a requisição
 * @param {number} maxRetries - Número máximo de tentativas
 * @returns {Promise}
 */
export const withAuthRetry = async (requestFn, maxRetries = 1) => {
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        if (attempts < maxRetries) {
          try {
            // Tentar renovar token
            await authService.refreshToken();
            attempts++;
            continue;
          } catch (refreshError) {
            // Se falhar ao renovar, fazer logout
            await authService.logout();
            throw new Error('Sessão expirada. Faça login novamente.');
          }
        }
      }
      throw error;
    }
  }
};

/**
 * Debounce para renovação de token
 */
let tokenRefreshPromise = null;

export const refreshTokenDebounced = async () => {
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }
  
  tokenRefreshPromise = authService.refreshToken();
  
  try {
    const result = await tokenRefreshPromise;
    return result;
  } finally {
    tokenRefreshPromise = null;
  }
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_NAMES,
  hasPermission,
  canViewTalhoes,
  canCreateTalhoes,
  canEditTalhoes,
  canDeleteTalhoes,
  canViewStatistics,
  canManageUsers,
  hasAdminAccess,
  getUserPermissions,
  isTokenNearExpiry,
  getTokenTimeToExpiry,
  formatUserInfo,
  getUserInitials,
  isValidEmail,
  validatePassword,
  withAuthRetry,
  refreshTokenDebounced
};

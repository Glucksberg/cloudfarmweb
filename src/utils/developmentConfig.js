// Configuração para modo de desenvolvimento - Mixed Content workaround
export const isDevelopmentMode = () => {
  // Detectar se estamos em modo de desenvolvimento
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         process.env.REACT_APP_DEV_MODE === 'true';
};

export const shouldBypassSSL = () => {
  // Permitir bypass SSL apenas em desenvolvimento
  return isDevelopmentMode() || process.env.REACT_APP_BYPASS_SSL === 'true';
};

export const getAPIConfig = () => {
  const isHTTPS = window.location.protocol === 'https:';
  const isDev = isDevelopmentMode();
  
  // Se página é HTTPS mas queremos conectar HTTP (mixed content)
  if (isHTTPS && !isDev) {
    console.warn('🚫 Mixed Content detected: HTTPS page trying to access HTTP backend');
    
    // Opções para resolver mixed content
    const solutions = {
      proxy: `${window.location.origin}/api-proxy`,
      tunnel: process.env.REACT_APP_TUNNEL_URL,
      local: 'http://localhost:3001/api'
    };
    
    return {
      problem: 'mixed-content',
      solutions,
      recommended: solutions.proxy
    };
  }
  
  // Configuração normal
  return {
    apiURL: process.env.REACT_APP_CLOUDFARM_API_URL,
    wsURL: process.env.REACT_APP_CLOUDFARM_WS_URL,
    problem: null
  };
};

export const createProxyRequest = async (url, options = {}) => {
  // Usar proxy local para contornar mixed content
  const proxyURL = `${window.location.origin}/api-proxy`;
  const targetURL = encodeURIComponent(url);
  
  return fetch(`${proxyURL}?target=${targetURL}`, {
    ...options,
    headers: {
      ...options.headers,
      'X-Proxy-Target': url
    }
  });
};

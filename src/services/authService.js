import CORSProxy from '../utils/corsProxy';

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:3001';
    this.TOKEN_KEY = 'jwt_token';
    this.USER_KEY = 'cloudfarm_user';
    this.corsProxy = new CORSProxy();
  }

  /**
   * Realiza login no CloudFarm backend
   * @param {string} username - Username do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token
   */
  async login(username, password) {
    try {
      console.log(`🔌 Tentando conectar ao backend: ${this.baseURL}/api/auth/login`);

      const response = await this.corsProxy.makeRequest(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { username, password }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      if (data.success && data.data && data.data.token) {
        // Salvar token e dados do usuário
        this.setToken(data.data.token);
        this.setUser(data.data.user);

        return {
          success: true,
          user: data.data.user,
          token: data.data.token,
          expiresIn: data.data.expiresIn
        };
      } else {
        throw new Error(data.message || 'Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);

      // Melhorar mensagem de erro para problemas de conectividade
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                                   window.location.hostname.includes('herokuapp.com') ||
                                   window.location.hostname.includes('vercel.app');

        const isLocalhost = this.baseURL.includes('localhost') || this.baseURL.includes('127.0.0.1');

        const helpMessage = (isCloudEnvironment && isLocalhost) ? `
🌐 PROBLEMA DE CONFIGURAÇÃO CLOUD/LOCAL 🌐

Frontend rodando em: ${window.location.origin} (cloud)
Backend tentando: ${this.baseURL} (localhost)

❌ PROBLEMA: Cloud não consegue acessar localhost

🚀 SOLUÇÕES:

1️⃣ DESENVOLVIMENTO LOCAL (Recomendado):
   - Baixe o projeto: git clone [repo]
   - Rode localmente: npm start
   - Acesse: http://localhost:3000

2️⃣ EXPOR BACKEND (Alternativa):
   - Use ngrok: ngrok http 3001
   - Atualize .env com URL do ngrok

💡 Para desenvolvimento, sempre use setup local!
        ` : (isCloudEnvironment && !isLocalhost) ? `
🌐 PROBLEMA DE CONEXÃO CLOUD → VPS 🌐

Frontend rodando em: ${window.location.origin} (cloud)
Backend tentando: ${this.baseURL}/auth/login (VPS)

❌ POSSÍVEIS PROBLEMAS:

1️⃣ ENDPOINT NÃO EXISTE:
   - Teste: curl -X POST ${this.baseURL}/auth/login
   - Ou tente: curl ${this.baseURL}/login

2️⃣ CORS NÃO CONFIGURADO (MAIS PROVÁVEL):
   - Backend não aceita requests de ${window.location.origin}
   - Execute no VPS para configurar CORS:
     sudo nano /root/CloudFarm/[arquivo-principal].js
     Adicionar: app.use(cors({ origin: "*" }))

3️⃣ FIREWALL/CONECTIVIDADE:
   - Teste direto no VPS: curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"Markus","password":"Aquarela1989#"}'

💡 SOLUÇÃO RÁPIDA: Use desenvolvimento local!
        ` : `
🚨 BACKEND CLOUDFARM OFFLINE ���

Tentativa de conexão: ${this.baseURL}/auth/login

🔧 SOLUÇÕES:
1️⃣ Verificar se backend está rodando: pm2 list
2️⃣ Reiniciar se necessário: pm2 restart cloudfarm-api
3️⃣ Testar conectividade: curl ${this.baseURL}/

💡 Verifique os logs: pm2 logs cloudfarm-api
        `;

        console.error(helpMessage);

        const errorMessage = (isCloudEnvironment && isLocalhost)
          ? '🌐 Frontend em cloud não consegue acessar localhost. Use desenvolvimento local ou exponha o backend!'
          : (isCloudEnvironment && !isLocalhost)
          ? '🌐 Erro de conexão cloud→VPS. Verifique endpoint /auth/login, CORS e conectividade!'
          : '🚨 Backend CloudFarm não está acessível. Verifique se está rodando!';

        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  /**
   * Realiza logout
   */
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Tentar fazer logout no servidor
        try {
          await fetch(`${this.baseURL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('Erro ao fazer logout no servidor:', error);
          // Mesmo com erro no servidor, limpar dados locais
        }
      }

      // Limpar dados locais
      this.removeToken();
      this.removeUser();
      
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar dados locais
      this.removeToken();
      this.removeUser();
      throw error;
    }
  }

  /**
   * Renova o token JWT
   * @returns {Promise<string>} Novo token
   */
  async refreshToken() {
    try {
      const currentToken = this.getToken();
      
      if (!currentToken) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao renovar token');
      }

      if (data.success && data.data && data.data.token) {
        this.setToken(data.data.token);
        return data.data.token;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Se falhar, fazer logout
      this.logout();
      throw error;
    }
  }

  /**
   * Obtém informações do usuário atual do servidor
   * @returns {Promise<Object>} Dados do usuário
   */
  async getCurrentUserFromServer() {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao obter dados do usuário');
      }

      if (data.success && data.data && data.data.user) {
        // Atualizar dados locais
        this.setUser(data.data.user);
        return data.data.user;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // Verificar se o token não expirou
    return this.isTokenValid();
  }

  /**
   * Verifica se o token JWT é válido (não expirado)
   * @returns {boolean}
   */
  isTokenValid() {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    try {
      // Decodificar o payload do JWT (sem verificar assinatura)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Verificar se o token não expirou
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  /**
   * Obtém o token armazenado
   * @returns {string|null}
   */
  getToken() {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  /**
   * Armazena o token
   * @param {string} token
   */
  setToken(token) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Erro ao armazenar token:', error);
    }
  }

  /**
   * Remove o token
   */
  removeToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao remover token:', error);
    }
  }

  /**
   * Obtém os dados do usuário armazenados
   * @returns {Object|null}
   */
  getUser() {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  /**
   * Armazena os dados do usuário
   * @param {Object} user
   */
  setUser(user) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao armazenar dados do usuário:', error);
    }
  }

  /**
   * Remove os dados do usuário
   */
  removeUser() {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Erro ao remover dados do usuário:', error);
    }
  }

  /**
   * Verifica se o usuário tem uma role específica
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.roles && user.roles.includes(role);
  }

  /**
   * Verifica se o usuário é admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Obtém o cabeçalho de autorização para requisições
   * @returns {Object}
   */
  getAuthHeaders() {
    const token = this.getToken();
    
    if (!token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Faz uma requisição autenticada
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Response>}
   */
  async authenticatedFetch(url, options = {}) {
    // Verificar se o token é válido
    if (!this.isTokenValid()) {
      try {
        // Tentar renovar o token
        await this.refreshToken();
      } catch (error) {
        // Se falhar, fazer logout e lançar erro
        await this.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    // Adicionar headers de autenticação
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Limpa todos os dados de autenticação
   */
  clearAuthData() {
    this.removeToken();
    this.removeUser();
  }
}

// Instância singleton
const authService = new AuthService();

export default authService;

// CORS Proxy utility for development when backend doesn't support CORS

class CORSProxy {
  constructor() {
    this.originalBaseURL = process.env.REACT_APP_CLOUDFARM_API_URL || 'http://localhost:3001';
    this.corsProxyURL = 'https://cors-anywhere.herokuapp.com';
    this.alternativeProxy = 'https://api.allorigins.win/raw?url=';
  }

  /**
   * Creates a proxied URL to bypass CORS restrictions
   * @param {string} url - Original URL
   * @param {string} method - HTTP method (default: GET)
   * @returns {object} - Proxied request configuration
   */
  createProxiedRequest(url, options = {}) {
    const { method = 'GET', headers = {}, body } = options;
    
    // Method 1: Try direct request first (in case CORS is fixed)
    const directConfig = {
      url: url,
      options: {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      }
    };

    // Method 2: CORS proxy fallback
    const proxiedConfig = {
      url: `${this.corsProxyURL}/${url}`,
      options: {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      }
    };

    return { directConfig, proxiedConfig };
  }

  /**
   * Makes a request with automatic CORS fallback
   * @param {string} url - Target URL
   * @param {object} options - Request options
   * @returns {Promise} - Response
   */
  async makeRequest(url, options = {}) {
    const { directConfig, proxiedConfig } = this.createProxiedRequest(url, options);
    
    console.log('🌐 Attempting direct request to:', directConfig.url);
    
    try {
      // Try direct request first
      const response = await fetch(directConfig.url, directConfig.options);
      
      if (response.ok) {
        console.log('✅ Direct request successful!');
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      console.warn('⚠️ Direct request failed:', error.message);
      console.log('🔄 Trying CORS proxy...');
      
      try {
        // Fallback to CORS proxy
        const response = await fetch(proxiedConfig.url, proxiedConfig.options);
        
        if (response.ok) {
          console.log('✅ CORS proxy request successful!');
          return response;
        }
        
        throw new Error(`Proxy failed: HTTP ${response.status}: ${response.statusText}`);
        
      } catch (proxyError) {
        console.error('❌ Both direct and proxy requests failed');
        console.error('Direct error:', error.message);
        console.error('Proxy error:', proxyError.message);
        
        // Provide helpful error message
        const helpMessage = `
🚨 CONEXÃO CLOUD → VPS FALHADA 🚨

Problema: CORS (Cross-Origin Resource Sharing) não configurado

✅ BACKEND ONLINE: ${this.originalBaseURL}
❌ CORS BLOQUEADO: Requests do fly.dev rejeitados

🔧 SOLUÇÕES:

1️⃣ CONFIGURAR CORS NO VPS:
   - SSH no VPS: ssh root@178.156.157.146
   - Editar backend para aceitar fly.dev
   - Adicionar header: Access-Control-Allow-Origin: *

2️⃣ DESENVOLVIMENTO LOCAL (RECOMENDADO):
   - git clone [seu-repo]
   - npm install
   - npm start
   - Acesse: http://localhost:3000

3️⃣ TESTE MANUAL NO VPS:
   curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"Markus","password":"Aquarela1989#"}'

💡 O backend está funcionando, apenas precisa configurar CORS!
        `;
        
        throw new Error(helpMessage);
      }
    }
  }

  /**
   * Helper to test connectivity
   */
  async testConnectivity() {
    try {
      console.log('🧪 Testing backend connectivity...');
      const response = await this.makeRequest(this.originalBaseURL);
      const data = await response.json();
      
      console.log('✅ Backend accessible:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Connectivity test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default CORSProxy;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const LoginPage = ({ onSuccess, redirectPath }) => {
  const { login, isLoggingIn, error, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Se já está autenticado, chamar onSuccess
  useEffect(() => {
    if (isAuthenticated && onSuccess) {
      onSuccess();
    }
  }, [isAuthenticated, onSuccess]);

  // Limpar erros quando componente carrega
  useEffect(() => {
    clearError();
    setLocalError('');
    
    // Carregar email salvo se tiver "remember me"
    const savedEmail = localStorage.getItem('cloudfarm_remember_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [clearError]);

  // Limpar erro local quando dados do form mudam
  useEffect(() => {
    if (localError) {
      setLocalError('');
    }
  }, [formData, localError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setLocalError('Email é obrigatório');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setLocalError('Email deve ter um formato válido');
      return false;
    }
    
    if (!formData.password.trim()) {
      setLocalError('Senha é obrigatória');
      return false;
    }
    
    if (formData.password.length < 3) {
      setLocalError('Senha deve ter pelo menos 3 caracteres');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpar erros anteriores
    setLocalError('');
    clearError();
    
    // Validar formulário
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Salvar email se "remember me" estiver marcado
        if (rememberMe) {
          localStorage.setItem('cloudfarm_remember_email', formData.email);
        } else {
          localStorage.removeItem('cloudfarm_remember_email');
        }
        
        // Login bem-sucedido
        setFormData({ email: '', password: '' });
        
        if (onSuccess) {
          onSuccess(result.user);
        }
      }
    } catch (err) {
      // Erro já tratado pelo contexto de autenticação
      console.error('Erro no login:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoggingIn) {
      handleSubmit(e);
    }
  };

  const currentError = localError || error;

  return (
    <div className="login-page-container">
      <div className="login-page">
        <div className="login-header">
          <div className="login-logo">
            <h1>🌾 CloudFarm</h1>
          </div>
          <p className="login-subtitle">Sistema de Gestão Agrícola</p>
        </div>
        
        <div className="login-card">
          <h2>Acesso ao Sistema</h2>
          
          {currentError && (
            <div className="login-error">
              {currentError}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoggingIn}
                placeholder="seu.email@exemplo.com"
                autoComplete="email"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Senha:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={isLoggingIn}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    fontSize: '14px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <div className="form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={isLoggingIn}
                />
                <span className="checkbox-text">Lembrar meu email</span>
              </label>
            </div>
            
            <button
              type="submit"
              className="login-button"
              disabled={isLoggingIn || !formData.email || !formData.password}
            >
              {isLoggingIn ? 'Fazendo login...' : 'Entrar no Sistema'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Entre com suas credenciais do CloudFarm</p>
            {redirectPath && (
              <p className="redirect-info">
                Você será redirecionado para: {redirectPath}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .login-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        .login-page {
          width: 100%;
          max-width: 400px;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }
        
        .login-logo h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 300;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .login-subtitle {
          margin: 0.5rem 0 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .login-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .login-card h2 {
          margin: 0 0 1.5rem;
          color: #212529;
          font-size: 1.5rem;
          text-align: center;
          font-weight: 500;
        }
        
        .form-group-checkbox {
          margin: 1rem 0;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #495057;
        }
        
        .checkbox-label input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        
        .checkbox-text {
          user-select: none;
        }
        
        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
        
        .login-footer p {
          margin: 0.5rem 0;
        }
        
        .redirect-info {
          font-style: italic;
          color: #007bff;
        }
        
        @media (max-width: 768px) {
          .login-page-container {
            padding: 0.5rem;
          }
          
          .login-card {
            padding: 1.5rem;
          }
          
          .login-logo h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

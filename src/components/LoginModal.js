import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, isLoggingIn, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Limpar erros quando modal abre
  useEffect(() => {
    if (isOpen) {
      clearError();
      setLocalError('');
      setFormData({ email: '', password: '' });
    }
  }, [isOpen, clearError]);

  // Limpar erro local quando dados do form mudam
  useEffect(() => {
    setLocalError('');
  }, [formData.username, formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Limpar erro local quando usuário começa a digitar
    if (localError) {
      setLocalError('');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        // Login bem-sucedido
        setFormData({ email: '', password: '' });
        
        if (onSuccess) {
          onSuccess(result.user);
        }
        
        if (onClose) {
          onClose();
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose && !isLoggingIn) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const currentError = localError || error;

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <h2>Login CloudFarm</h2>
        
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
                {showPassword ? '👁️' : '👁️���🗨️'}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="login-button"
            disabled={isLoggingIn || !formData.email || !formData.password}
          >
            {isLoggingIn ? 'Fazendo login...' : 'Entrar'}
          </button>
        </form>
        
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingIn}
            style={{
              marginTop: '1rem',
              background: 'none',
              border: '1px solid #ced4da',
              color: '#6c757d',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
        )}
        
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '12px', color: '#6c757d' }}>
          <p>Entre com suas credenciais do CloudFarm</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

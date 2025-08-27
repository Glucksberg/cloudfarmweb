import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserInfo from './UserInfo';
import LoginModal from './LoginModal';
import ConnectionDiagnostic from './ConnectionDiagnostic';
import './Layout.css';

const Layout = () => {
  const { isAuthenticated, isChecking, user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/logs', icon: '📝', label: 'Logs' },
    { path: '/talhoes', icon: '🗺️', label: 'Talhões' },
    { path: '/mapfinal', icon: '🛡️', label: 'Teste Final' },
    { path: '/estoque', icon: '📦', label: 'Estoque' },
    { path: '/equipe', icon: '👥', label: 'Equipe' },
    { path: '/configuracoes', icon: '⚙️', label: 'Configurações' }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="menu-toggle desktop-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <button 
              className="menu-toggle mobile-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              ☰
            </button>
            <div className="logo">
              <span className="logo-icon">🌾</span>
              <span className="logo-text">CloudFarm</span>
            </div>
          </div>
          <div className="header-center">
            <span className="farm-selector">Fazenda São João</span>
          </div>
          <div className="header-right">
            <button className="notification-btn" aria-label="Notificações">
              🔔
            </button>

            {/* Componente de informações do usuário */}
            {isAuthenticated && user ? (
              <UserInfo
                user={user}
                showDropdown={true}
                showFarmInfo={true}
                className="header-user-info"
              />
            ) : (
              <button
                className="login-btn"
                onClick={() => setShowLoginModal(true)}
                aria-label="Fazer login"
              >
                🔑 Login
              </button>
            )}
          </div>
        </div>
        <div className="header-banner">
          <p className="banner-text">Gestão inteligente para o campo</p>
        </div>
      </header>

      <div className="main-container">
        {/* Desktop Sidebar */}
        <aside className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarExpanded && <span className="nav-label">{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <>
            <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
            <aside className="mobile-sidebar">
              <nav className="sidebar-nav">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleMenuClick(item.path)}
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* Content Area */}
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <span>CloudFarm © 2025 | Todos direitos reservados</span>
          </div>
          <div className="footer-links">
            <a href="#termos">Termos</a>
            <a href="#privacidade">Privacidade</a>
            <a href="#suporte">Suporte</a>
            <a href="#contato">Contato</a>
          </div>
        </div>
      </footer>

      {/* Modal de Login */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const UserInfo = ({ 
  showLogoutButton = true, 
  showRoles = true, 
  showFarmInfo = true,
  compact = false,
  className = '' 
}) => {
  const { user, logout, isLoggingOut, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Erro no logout:', error);
      }
    }
  };

  const getUserInitials = () => {
    if (!user.name) return '?';
    
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  const formatRole = (role) => {
    const roleMap = {
      'admin': 'Administrador',
      'user': 'Usuário',
      'manager': 'Gerente',
      'operator': 'Operador'
    };
    return roleMap[role] || role;
  };

  if (compact) {
    return (
      <div className={`user-info compact ${className}`}>
        <div 
          className="user-avatar-container"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          
          {showDropdown && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
                {showFarmInfo && user.farm_name && (
                  <div className="user-farm">{user.farm_name}</div>
                )}
              </div>
              
              {showRoles && user.roles && user.roles.length > 0 && (
                <div className="user-dropdown-roles">
                  {user.roles.map((role, index) => (
                    <span key={index} className={`user-role ${role}`}>
                      {formatRole(role)}
                    </span>
                  ))}
                </div>
              )}
              
              {showLogoutButton && (
                <div className="user-dropdown-actions">
                  <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="logout-button"
                  >
                    {isLoggingOut ? 'Saindo...' : 'Sair'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`user-info ${className}`}>
      <div className="user-avatar">
        {getUserInitials()}
      </div>
      
      <div className="user-details">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
        
        {showFarmInfo && user.farm_name && (
          <div className="user-farm">
            <span className="farm-label">Fazenda:</span> {user.farm_name}
          </div>
        )}
        
        {showRoles && user.roles && user.roles.length > 0 && (
          <div className="user-roles">
            {user.roles.map((role, index) => (
              <span key={index} className={`user-role ${role}`}>
                {formatRole(role)}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {showLogoutButton && (
        <div className="user-actions">
          <button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="logout-button"
          >
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      )}
      
      <style jsx>{`
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-info.compact {
          position: relative;
        }
        
        .user-avatar-container {
          position: relative;
        }
        
        .user-details {
          flex: 1;
          min-width: 0;
        }
        
        .user-name {
          font-weight: 500;
          color: #212529;
          font-size: 14px;
          margin-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .user-email {
          color: #6c757d;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .user-farm {
          color: #495057;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .farm-label {
          font-weight: 500;
        }
        
        .user-roles {
          margin-top: 4px;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        
        .user-actions {
          margin-left: auto;
        }
        
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 1rem;
          min-width: 200px;
          z-index: 1000;
          margin-top: 4px;
        }
        
        .user-dropdown-header {
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .user-dropdown .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #212529;
          margin-bottom: 2px;
        }
        
        .user-dropdown .user-email {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 2px;
        }
        
        .user-dropdown .user-farm {
          font-size: 12px;
          color: #495057;
        }
        
        .user-dropdown-roles {
          margin-bottom: 0.5rem;
        }
        
        .user-dropdown-actions {
          padding-top: 0.5rem;
          border-top: 1px solid #dee2e6;
        }
        
        .user-dropdown-actions .logout-button {
          width: 100%;
          font-size: 12px;
          padding: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .user-info:not(.compact) {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .user-details {
            width: 100%;
          }
          
          .user-actions {
            margin-left: 0;
            width: 100%;
          }
          
          .user-actions .logout-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UserInfo;

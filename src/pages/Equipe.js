import React, { useState } from 'react';
import './Pages.css';

const Equipe = () => {
  const [filterRole, setFilterRole] = useState('todos');

  const team = [
    { id: 1, name: 'João Silva', role: 'operador', status: 'online', phone: '(61) 99999-1111', email: 'joao@fazenda.com', sector: 'Campo' },
    { id: 2, name: 'Maria Santos', role: 'gerente', status: 'online', phone: '(61) 99999-2222', email: 'maria@fazenda.com', sector: 'Administração' },
    { id: 3, name: 'Pedro Costa', role: 'tecnico', status: 'offline', phone: '(61) 99999-3333', email: 'pedro@fazenda.com', sector: 'Manutenção' },
    { id: 4, name: 'Ana Oliveira', role: 'operador', status: 'online', phone: '(61) 99999-4444', email: 'ana@fazenda.com', sector: 'Estoque' },
    { id: 5, name: 'Carlos Lima', role: 'operador', status: 'online', phone: '(61) 99999-5555', email: 'carlos@fazenda.com', sector: 'Campo' },
    { id: 6, name: 'Roberto Mendes', role: 'supervisor', status: 'offline', phone: '(61) 99999-6666', email: 'roberto@fazenda.com', sector: 'Produção' },
    { id: 7, name: 'José Ferreira', role: 'operador', status: 'online', phone: '(61) 99999-7777', email: 'jose@fazenda.com', sector: 'Campo' },
    { id: 8, name: 'Luiza Campos', role: 'tecnico', status: 'online', phone: '(61) 99999-8888', email: 'luiza@fazenda.com', sector: 'Laboratório' }
  ];

  const roles = [
    { id: 'todos', name: 'Todos', icon: '👥' },
    { id: 'gerente', name: 'Gerentes', icon: '👔' },
    { id: 'supervisor', name: 'Supervisores', icon: '👨‍💼' },
    { id: 'tecnico', name: 'Técnicos', icon: '🔧' },
    { id: 'operador', name: 'Operadores', icon: '👷' }
  ];

  const filteredTeam = filterRole === 'todos' 
    ? team 
    : team.filter(member => member.role === filterRole);

  const getRoleIcon = (role) => {
    const icons = {
      gerente: '👔',
      supervisor: '👨‍💼',
      tecnico: '🔧',
      operador: '👷'
    };
    return icons[role] || '👤';
  };

  const getRoleName = (role) => {
    const names = {
      gerente: 'Gerente',
      supervisor: 'Supervisor',
      tecnico: 'Técnico',
      operador: 'Operador'
    };
    return names[role] || role;
  };

  const getStatusColor = (status) => {
    return status === 'online' ? '#4CAF50' : '#757575';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 Equipe</h1>
        <p>Gestão da equipe de funcionários</p>
      </div>

      <div className="role-filters">
        {roles.map((role) => (
          <button
            key={role.id}
            className={`role-filter ${filterRole === role.id ? 'active' : ''}`}
            onClick={() => setFilterRole(role.id)}
          >
            <span className="filter-icon">{role.icon}</span>
            <span className="filter-name">{role.name}</span>
          </button>
        ))}
      </div>

      <div className="team-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-content">
            <span className="stat-number">{filteredTeam.length}</span>
            <span className="stat-label">Funcionários</span>
          </div>
        </div>
        <div className="stat-card online">
          <span className="stat-icon">🟢</span>
          <div className="stat-content">
            <span className="stat-number">{filteredTeam.filter(m => m.status === 'online').length}</span>
            <span className="stat-label">Online</span>
          </div>
        </div>
        <div className="stat-card offline">
          <span className="stat-icon">⚪</span>
          <div className="stat-content">
            <span className="stat-number">{filteredTeam.filter(m => m.status === 'offline').length}</span>
            <span className="stat-label">Offline</span>
          </div>
        </div>
      </div>

      <div className="team-grid">
        {filteredTeam.map((member) => (
          <div key={member.id} className="employee-card">
            <div className="employee-header">
              <div className="employee-avatar">
                <span className="avatar-icon">{getRoleIcon(member.role)}</span>
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(member.status) }}
                ></div>
              </div>
              <div className="employee-info">
                <h3 className="employee-name">{member.name}</h3>
                <span className="employee-role">{getRoleName(member.role)}</span>
              </div>
            </div>

            <div className="employee-details">
              <div className="detail-row">
                <span className="detail-icon">🏢</span>
                <span className="detail-text">{member.sector}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">📱</span>
                <span className="detail-text">{member.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">📧</span>
                <span className="detail-text">{member.email}</span>
              </div>
            </div>

            <div className="employee-actions">
              <button className="contact-btn phone">
                <span>📞</span>
              </button>
              <button className="contact-btn email">
                <span>📧</span>
              </button>
              <button className="contact-btn message">
                <span>💬</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equipe;

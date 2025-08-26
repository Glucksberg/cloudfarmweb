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
    <div className=\"page-container\">\n      <div className=\"page-header\">\n        <h1>👥 Equipe</h1>\n        <p>Gestão da equipe de funcionários</p>\n      </div>\n\n      <div className=\"role-filters\">\n        {roles.map((role) => (\n          <button\n            key={role.id}\n            className={`role-filter ${filterRole === role.id ? 'active' : ''}`}\n            onClick={() => setFilterRole(role.id)}\n          >\n            <span className=\"filter-icon\">{role.icon}</span>\n            <span className=\"filter-name\">{role.name}</span>\n          </button>\n        ))}\n      </div>\n\n      <div className=\"team-stats\">\n        <div className=\"stat-card\">\n          <span className=\"stat-icon\">👥</span>\n          <div className=\"stat-content\">\n            <span className=\"stat-number\">{filteredTeam.length}</span>\n            <span className=\"stat-label\">Funcionários</span>\n          </div>\n        </div>\n        <div className=\"stat-card online\">\n          <span className=\"stat-icon\">🟢</span>\n          <div className=\"stat-content\">\n            <span className=\"stat-number\">{filteredTeam.filter(m => m.status === 'online').length}</span>\n            <span className=\"stat-label\">Online</span>\n          </div>\n        </div>\n        <div className=\"stat-card offline\">\n          <span className=\"stat-icon\">⚪</span>\n          <div className=\"stat-content\">\n            <span className=\"stat-number\">{filteredTeam.filter(m => m.status === 'offline').length}</span>\n            <span className=\"stat-label\">Offline</span>\n          </div>\n        </div>\n      </div>\n\n      <div className=\"team-grid\">\n        {filteredTeam.map((member) => (\n          <div key={member.id} className=\"employee-card\">\n            <div className=\"employee-header\">\n              <div className=\"employee-avatar\">\n                <span className=\"avatar-icon\">{getRoleIcon(member.role)}</span>\n                <div \n                  className=\"status-indicator\"\n                  style={{ backgroundColor: getStatusColor(member.status) }}\n                ></div>\n              </div>\n              <div className=\"employee-info\">\n                <h3 className=\"employee-name\">{member.name}</h3>\n                <span className=\"employee-role\">{getRoleName(member.role)}</span>\n              </div>\n            </div>\n\n            <div className=\"employee-details\">\n              <div className=\"detail-row\">\n                <span className=\"detail-icon\">🏢</span>\n                <span className=\"detail-text\">{member.sector}</span>\n              </div>\n              <div className=\"detail-row\">\n                <span className=\"detail-icon\">📱</span>\n                <span className=\"detail-text\">{member.phone}</span>\n              </div>\n              <div className=\"detail-row\">\n                <span className=\"detail-icon\">📧</span>\n                <span className=\"detail-text\">{member.email}</span>\n              </div>\n            </div>\n\n            <div className=\"employee-actions\">\n              <button className=\"contact-btn phone\">\n                <span>📞</span>\n              </button>\n              <button className=\"contact-btn email\">\n                <span>📧</span>\n              </button>\n              <button className=\"contact-btn message\">\n                <span>💬</span>\n              </button>\n            </div>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n};\n\nexport default Equipe;"
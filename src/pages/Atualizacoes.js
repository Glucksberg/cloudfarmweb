import React, { useState } from 'react';
import './Pages.css';

const Atualizacoes = () => {
  const [filter, setFilter] = useState('todos');
  
  const activities = [
    { id: 1, time: 'Agora', type: 'aplicacao', title: 'Aplicação no T3', desc: 'Markus iniciou pulverização com defensivo', module: 'Talhões' },
    { id: 2, time: '15min', type: 'colheita', title: 'Colheita T1 finalizada', desc: '50 hectares colhidos - Produção: 3.2t/ha', module: 'Operações' },
    { id: 3, time: '1h', type: 'estoque', title: 'Novo produto no estoque', desc: '500kg de Adubo KCL adicionado ao armazém', module: 'Estoque' },
    { id: 4, time: '2h', type: 'plantio', title: 'Plantio T5 iniciado', desc: 'Soja OLIMPO - 85 hectares', module: 'Talhões' },
    { id: 5, time: '3h', type: 'manutencao', title: 'Manutenção concluída', desc: 'Trator John Deere 7230R - Revisão completa', module: 'Equipamentos' }
  ];

  const filteredActivities = filter === 'todos' ? activities : activities.filter(act => act.type === filter);

  const getIcon = (type) => {
    const icons = {
      aplicacao: '🚿',
      colheita: '🌾',
      estoque: '📦',
      plantio: '🌱',
      manutencao: '🔧'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔄 Atualizações</h1>
        <p>Feed em tempo real das atividades da fazenda</p>
      </div>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'todos' ? 'active' : ''}`}
          onClick={() => setFilter('todos')}
        >
          Todos
        </button>
        <button 
          className={`filter-btn ${filter === 'plantio' ? 'active' : ''}`}
          onClick={() => setFilter('plantio')}
        >
          Plantio
        </button>
        <button 
          className={`filter-btn ${filter === 'colheita' ? 'active' : ''}`}
          onClick={() => setFilter('colheita')}
        >
          Colheita
        </button>
        <button 
          className={`filter-btn ${filter === 'aplicacao' ? 'active' : ''}`}
          onClick={() => setFilter('aplicacao')}
        >
          Aplicação
        </button>
        <button 
          className={`filter-btn ${filter === 'estoque' ? 'active' : ''}`}
          onClick={() => setFilter('estoque')}
        >
          Estoque
        </button>
      </div>

      <div className="activity-feed">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <div className="activity-indicator">
              <span className="activity-icon">{getIcon(activity.type)}</span>
              <div className="activity-line"></div>
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <span className="activity-time">{activity.time}</span>
                <span className="activity-module">{activity.module}</span>
              </div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-desc">{activity.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Atualizacoes;

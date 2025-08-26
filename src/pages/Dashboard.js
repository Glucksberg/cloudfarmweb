import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const metrics = [
    { title: 'Talhões', value: '24', icon: '🗺️', color: '#2E7D32' },
    { title: 'Estoque', value: 'R$45k', icon: '📦', color: '#1976D2' },
    { title: 'Equipe', value: '12', icon: '👥', color: '#F57C00' },
    { title: 'Operações', value: '156', icon: '⚡', color: '#7B1FA2' }
  ];

  const recentActivities = [
    { time: 'Agora', activity: 'Aplicação no T3', user: 'Markus iniciou pulverização' },
    { time: '15min', activity: 'Colheita T1 finalizada', user: '50 hectares colhidos' },
    { time: '1h', activity: 'Novo produto no estoque', user: '500kg de Adubo KCL adicionado' },
    { time: '2h', activity: 'Plantio T5 iniciado', user: 'Soja OLIMPO - 85 hectares' }
  ];

  const upcomingTasks = [
    { task: 'Pulverização T4', date: 'Hoje 14:00', priority: 'alta' },
    { task: 'Colheita T2', date: 'Amanhã 08:00', priority: 'média' },
    { task: 'Plantio T6', date: '28/08 09:00', priority: 'baixa' },
    { task: 'Manutenção equipamentos', date: '30/08 07:00', priority: 'média' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Visão geral da fazenda - Fazenda São João</p>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card" style={{ borderLeft: `4px solid ${metric.color}` }}>
            <div className="metric-icon" style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div className="metric-content">
              <h3>{metric.value}</h3>
              <p>{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Production Chart Placeholder */}
        <div className="chart-widget">
          <h3>📈 Gráfico de Produção</h3>
          <div className="chart-placeholder">
            <div className="chart-bars">
              <div className="bar" style={{ height: '60%' }}></div>
              <div className="bar" style={{ height: '80%' }}></div>
              <div className="bar" style={{ height: '45%' }}></div>
              <div className="bar" style={{ height: '90%' }}></div>
              <div className="bar" style={{ height: '70%' }}></div>
              <div className="bar" style={{ height: '85%' }}></div>
            </div>
            <p className="chart-label">Produção dos últimos 6 meses</p>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="tasks-widget">
          <h3>📅 Próximas Tarefas</h3>
          <div className="tasks-list">
            {upcomingTasks.map((task, index) => (
              <div key={index} className={`task-item priority-${task.priority}`}>
                <div className="task-info">
                  <span className="task-name">{task.task}</span>
                  <span className="task-date">{task.date}</span>
                </div>
                <div className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts/Warnings */}
        <div className="alerts-widget">
          <h3>⚠️ Alertas e Avisos</h3>
          <div className="alerts-list">
            <div className="alert-item warning">
              <span className="alert-icon">🌧️</span>
              <div className="alert-content">
                <span className="alert-title">Previsão de Chuva</span>
                <span className="alert-desc">80% chance para amanhã</span>
              </div>
            </div>
            <div className="alert-item info">
              <span className="alert-icon">📦</span>
              <div className="alert-content">
                <span className="alert-title">Estoque Baixo</span>
                <span className="alert-desc">Glifosato: apenas 50L</span>
              </div>
            </div>
            <div className="alert-item success">
              <span className="alert-icon">✅</span>
              <div className="alert-content">
                <span className="alert-title">Colheita Concluída</span>
                <span className="alert-desc">T1 - 145 hectares</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="weather-widget">
          <h3>🌤️ Clima (7 dias)</h3>
          <div className="weather-grid">
            <div className="weather-day">
              <span className="day">Hoje</span>
              <span className="weather-icon">☀️</span>
              <span className="temp">28°C</span>
            </div>
            <div className="weather-day">
              <span className="day">Seg</span>
              <span className="weather-icon">🌧️</span>
              <span className="temp">24°C</span>
            </div>
            <div className="weather-day">
              <span className="day">Ter</span>
              <span className="weather-icon">⛅</span>
              <span className="temp">26°C</span>
            </div>
            <div className="weather-day">
              <span className="day">Qua</span>
              <span className="weather-icon">☀️</span>
              <span className="temp">30°C</span>
            </div>
            <div className="weather-day">
              <span className="day">Qui</span>
              <span className="weather-icon">🌤️</span>
              <span className="temp">27°C</span>
            </div>
            <div className="weather-day">
              <span className="day">Sex</span>
              <span className="weather-icon">☀️</span>
              <span className="temp">31°C</span>
            </div>
            <div className="weather-day">
              <span className="day">Sáb</span>
              <span className="weather-icon">⛅</span>
              <span className="temp">25°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="activities-section">
        <h3>🔄 Atividades Recentes</h3>
        <div className="activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-time">{activity.time}</div>
              <div className="activity-content">
                <span className="activity-title">{activity.activity}</span>
                <span className="activity-desc">{activity.user}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

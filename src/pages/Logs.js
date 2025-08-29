import React, { useState } from 'react';
import './Pages.css';

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterOperation, setFilterOperation] = useState('');

  const logs = [
    { id: 1, date: '25/08/2025', time: '14:30', module: 'Estoque', operation: 'Entrada', user: 'João Silva', details: 'Adubo KCL - 500kg' },
    { id: 2, date: '25/08/2025', time: '13:15', module: 'Talhão', operation: 'Plantio', user: 'Maria Santos', details: 'T5 - Soja OLIMPO - 85ha' },
    { id: 3, date: '25/08/2025', time: '11:45', module: 'Equipamentos', operation: 'Manutenção', user: 'Pedro Costa', details: 'Trator JD 7230R - Revisão' },
    { id: 4, date: '25/08/2025', time: '09:20', module: 'Talhão', operation: 'Aplicação', user: 'Carlos Lima', details: 'T3 - Fungicida - 45ha' },
    { id: 5, date: '24/08/2025', time: '16:10', module: 'Estoque', operation: 'Saída', user: 'Ana Oliveira', details: 'Sementes Soja - 100 sacas' },
    { id: 6, date: '24/08/2025', time: '14:25', module: 'Talhão', operation: 'Colheita', user: 'Roberto Mendes', details: 'T1 - Milho - 50ha - 3.2t/ha' },
    { id: 7, date: '24/08/2025', time: '10:35', module: 'Funcionários', operation: 'Ponto', user: 'Sistema', details: 'Check-in automático - 12 funcionários' },
    { id: 8, date: '23/08/2025', time: '15:50', module: 'Talhão', operation: 'Preparo', user: 'José Ferreira', details: 'T6 - Aração - 120ha' }
  ];

  const filteredLogs = logs.filter(log => {
    return (
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDate === '' || log.date.includes(filterDate)) &&
      (filterUser === '' || log.user.toLowerCase().includes(filterUser.toLowerCase())) &&
      (filterOperation === '' || log.operation === filterOperation)
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📝 Logs do Sistema</h1>
        <p>Histórico completo de atividades e operações</p>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar nos logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-row">
          <input
            type="text"
            placeholder="Data"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Funcionário"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="filter-input"
          />
          <select
            value={filterOperation}
            onChange={(e) => setFilterOperation(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas Operações</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
            <option value="Plantio">Plantio</option>
            <option value="Colheita">Colheita</option>
            <option value="Aplicação">Aplicação</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Preparo">Preparo</option>
          </select>
        </div>
      </div>

      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Módulo</th>
              <th>Operação</th>
              <th>Usuário</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td>{log.time}</td>
                <td><span className="module-badge">{log.module}</span></td>
                <td><span className="operation-badge">{log.operation}</span></td>
                <td>{log.user}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>{filteredLogs.length} registros encontrados</span>
        <button className="export-btn">📊 Exportar CSV</button>
      </div>
    </div>
  );
};

export default Logs;

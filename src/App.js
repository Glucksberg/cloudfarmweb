import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Atualizacoes from './pages/Atualizacoes';
import Logs from './pages/Logs';
import Talhoes from './pages/Talhoes';
import Estoque from './pages/Estoque';
import Equipe from './pages/Equipe';
import Configuracoes from './pages/Configuracoes';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="atualizacoes" element={<Atualizacoes />} />
          <Route path="logs" element={<Logs />} />
          <Route path="talhoes" element={<Talhoes />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="equipe" element={<Equipe />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import './Pages.css';

const Estoque = () => {
  const [activeCategory, setActiveCategory] = useState('todos');

  const products = [
    { id: 1, name: 'Soja RR', category: 'sementes', quantity: '500 sc', unit: 'sacas', level: 85, minLevel: 100 },
    { id: 2, name: 'Milho Pioneer', category: 'sementes', quantity: '200 sc', unit: 'sacas', level: 70, minLevel: 50 },
    { id: 3, name: 'Glifosato', category: 'defensivos', quantity: '50 L', unit: 'litros', level: 25, minLevel: 100 },
    { id: 4, name: 'Fungicida', category: 'defensivos', quantity: '80 L', unit: 'litros', level: 60, minLevel: 40 },
    { id: 5, name: 'Adubo NPK', category: 'fertilizantes', quantity: '2.5 t', unit: 'toneladas', level: 90, minLevel: 30 },
    { id: 6, name: 'KCL', category: 'fertilizantes', quantity: '1.8 t', unit: 'toneladas', level: 95, minLevel: 20 },
    { id: 7, name: 'Óleo Diesel', category: 'combustiveis', quantity: '3.2k L', unit: 'litros', level: 40, minLevel: 50 },
    { id: 8, name: 'Óleo Hidráulico', category: 'combustiveis', quantity: '500 L', unit: 'litros', level: 75, minLevel: 30 }
  ];

  const categories = [
    { id: 'todos', name: 'Todos', icon: '📦' },
    { id: 'sementes', name: 'Sementes', icon: '🌱' },
    { id: 'defensivos', name: 'Defensivos', icon: '🛡️' },
    { id: 'fertilizantes', name: 'Fertilizantes', icon: '🧪' },
    { id: 'combustiveis', name: 'Combustíveis', icon: '⛽' }
  ];

  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const getLevelColor = (level, minLevel) => {
    if (level < minLevel) return '#F44336'; // Vermelho - baixo
    if (level < minLevel * 1.5) return '#FF9800'; // Laranja - atenção
    return '#4CAF50'; // Verde - ok
  };

  const getLevelStatus = (level, minLevel) => {
    if (level < minLevel) return 'Baixo';
    if (level < minLevel * 1.5) return 'Atenção';
    return 'OK';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📦 Estoque</h1>
        <p>Controle de insumos e materiais da fazenda</p>
      </div>

      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="stock-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-icon">📊</span>
            <div className="summary-content">
              <span className="summary-number">{filteredProducts.length}</span>
              <span className="summary-label">Produtos</span>
            </div>
          </div>
          <div className="summary-card alert">
            <span className="summary-icon">⚠️</span>
            <div className="summary-content">
              <span className="summary-number">
                {filteredProducts.filter(p => p.level < p.minLevel).length}
              </span>
              <span className="summary-label">Estoque Baixo</span>
            </div>
          </div>
          <div className="summary-card success">
            <span className="summary-icon">✅</span>
            <div className="summary-content">
              <span className="summary-number">
                {filteredProducts.filter(p => p.level >= p.minLevel * 1.5).length}
              </span>
              <span className="summary-label">Estoque OK</span>
            </div>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <h3 className="product-name">{product.name}</h3>
              <span 
                className="stock-status"
                style={{ color: getLevelColor(product.level, product.minLevel) }}
              >
                {getLevelStatus(product.level, product.minLevel)}
              </span>
            </div>
            
            <div className="product-quantity">
              <span className="quantity-value">{product.quantity}</span>
              <span className="quantity-unit">{product.unit}</span>
            </div>

            <div className="stock-level">
              <div className="level-bar">
                <div 
                  className="level-fill"
                  style={{ 
                    width: `${Math.min(product.level, 100)}%`,
                    backgroundColor: getLevelColor(product.level, product.minLevel)
                  }}
                ></div>
              </div>
              <div className="level-info">
                <span className="level-current">{product.level}%</span>
                <span className="level-min">Min: {product.minLevel}%</span>
              </div>
            </div>

            <div className="product-actions">
              <button className="action-btn primary">➕ Entrada</button>
              <button className="action-btn secondary">➖ Saída</button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.filter(p => p.level < p.minLevel).length > 0 && (
        <div className="low-stock-alert">
          <h3>⚠️ Produtos com Estoque Baixo</h3>
          <div className="alert-list">
            {filteredProducts
              .filter(p => p.level < p.minLevel)
              .map(product => (
                <div key={product.id} className="alert-item">
                  <span className="alert-product">{product.name}</span>
                  <span className="alert-quantity">{product.quantity}</span>
                  <span className="alert-level">{product.level}%</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Estoque;

import React, { useState, useEffect } from 'react';
import './Pages.css';

const Estoque = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [products, setProducts] = useState([
    // Sementes
    { id: 1, name: 'Soja RR', category: 'sementes', quantity: '500 sc' },
    { id: 2, name: 'Milho Pioneer 30F53', category: 'sementes', quantity: '200 sc' },
    { id: 3, name: 'Soja OLIMPO', category: 'sementes', quantity: '350 sc' },
    { id: 4, name: 'Milho SYN 505', category: 'sementes', quantity: '120 sc' },
    { id: 5, name: 'Sorgo BRS 330', category: 'sementes', quantity: '80 sc' },
    { id: 6, name: 'Algodão FM 993', category: 'sementes', quantity: '45 sc' },

    // Defensivos
    { id: 7, name: 'Glifosato 480', category: 'defensivos', quantity: '850 L' },
    { id: 8, name: 'Fungicida Tebuconazol', category: 'defensivos', quantity: '320 L' },
    { id: 9, name: 'Inseticida Cipermetrina', category: 'defensivos', quantity: '180 L' },
    { id: 10, name: 'Herbicida 2,4-D', category: 'defensivos', quantity: '240 L' },
    { id: 11, name: 'Fungicida Azoxistrobina', category: 'defensivos', quantity: '95 L' },
    { id: 12, name: 'Adjuvante Aureo', category: 'defensivos', quantity: '150 L' },

    // Fertilizantes
    { id: 13, name: 'NPK 20-05-20', category: 'fertilizantes', quantity: '12.5 t' },
    { id: 14, name: 'KCL', category: 'fertilizantes', quantity: '8.2 t' },
    { id: 15, name: 'Ureia 45%', category: 'fertilizantes', quantity: '15.8 t' },
    { id: 16, name: 'Superfosfato Simples', category: 'fertilizantes', quantity: '6.4 t' },
    { id: 17, name: 'Sulfato de Amônio', category: 'fertilizantes', quantity: '4.2 t' },
    { id: 18, name: 'MAP', category: 'fertilizantes', quantity: '9.7 t' },
    { id: 19, name: 'Calcário Dolomítico', category: 'fertilizantes', quantity: '25.3 t' },

    // Combustíveis
    { id: 20, name: 'Diesel S10', category: 'combustiveis', quantity: '4.8k L' },
    { id: 21, name: 'Óleo Hidráulico ISO 68', category: 'combustiveis', quantity: '580 L' },
    { id: 22, name: 'Óleo Motor 15W40', category: 'combustiveis', quantity: '320 L' },
    { id: 23, name: 'Graxa Multiuso', category: 'combustiveis', quantity: '45 kg' },
    { id: 24, name: 'Arla 32', category: 'combustiveis', quantity: '1.2k L' },
    { id: 25, name: 'Óleo Transmissão', category: 'combustiveis', quantity: '180 L' }
  ]);

  // Função para conectar com API/WebSocket do Telegram
  useEffect(() => {
    // TODO: Implementar conexão WebSocket para receber atualizações do estoque em tempo real
    // const connectWebSocket = () => {
    //   const ws = new WebSocket('ws://localhost:3000/stock-updates');
    //   ws.onmessage = (event) => {
    //     const stockUpdate = JSON.parse(event.data);
    //     updateProductStock(stockUpdate);
    //   };
    // };
    // connectWebSocket();
  }, []);

  // Função para atualizar estoque quando receber dados da API
  const updateProductStock = (stockData) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === stockData.productId
          ? { ...product, quantity: stockData.quantity }
          : product
      )
    );
  };

  // Função para buscar dados iniciais da API
  const fetchStockData = async () => {
    try {
      // TODO: Implementar chamada para API do sistema Telegram
      // const response = await fetch('/api/stock');
      // const stockData = await response.json();
      // setProducts(stockData);
    } catch (error) {
      console.error('Erro ao buscar dados do estoque:', error);
    }
  };

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
          <div className="summary-card">
            <span className="summary-icon">📦</span>
            <div className="summary-content">
              <span className="summary-number">{products.length}</span>
              <span className="summary-label">Total Itens</span>
            </div>
          </div>
          <div className="summary-card">
            <span className="summary-icon">🔄</span>
            <div className="summary-content">
              <span className="summary-number">Telegram</span>
              <span className="summary-label">Controle via Bot</span>
            </div>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card compact">
            <div className="product-content">
              <h4 className="product-name">{product.name}</h4>
              <div className="product-quantity">
                <span className="quantity-value">{product.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="stock-info">
        <p className="info-text">
          💬 <strong>Gestão via Telegram:</strong> Entradas e saídas são controladas através do bot do Telegram.
          As informações são sincronizadas automaticamente.
        </p>
      </div>
    </div>
  );
};

export default Estoque;

#!/bin/bash

echo "🚀 Iniciando CloudFarm Web em modo de desenvolvimento local"
echo ""
echo "✅ Backend CloudFarm: localhost:3001 (PM2)"
echo "🌐 Frontend React: localhost:3000"
echo ""

# Verificar se backend está rodando
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend CloudFarm detectado na porta 3001"
else
    echo "❌ Backend CloudFarm não detectado. Verifique PM2:"
    echo "   pm2 list"
    echo "   pm2 logs cloudfarm-api"
    exit 1
fi

echo ""
echo "🔄 Iniciando frontend local..."
echo "📋 Configuração: .env aponta para localhost:3001"

# Iniciar desenvolvimento local
npm start

import axios from 'axios';

// Configuração da API de ações (usando Alpha Vantage como alternativa gratuita)
const STOCK_API_KEY = 'demo'; // Chave demo para testes
const STOCK_API_BASE_URL = 'https://www.alphavantage.co/query';

// Cache local para dados de ações
let stockCache = {
  data: [],
  timestamp: null,
  expiry: 5 * 60 * 1000 // 5 minutos
};

/**
 * Lista de ações brasileiras populares para monitoramento
 */
const BRAZILIAN_STOCKS = [
  { symbol: 'PETR4.SA', name: 'Petrobras', category: 'petróleo' },
  { symbol: 'VALE3.SA', name: 'Vale', category: 'mineração' },
  { symbol: 'ITUB4.SA', name: 'Itaú', category: 'financeiro' },
  { symbol: 'BBDC4.SA', name: 'Bradesco', category: 'financeiro' },
  { symbol: 'WEGE3.SA', name: 'Weg', category: 'industrial' },
  { symbol: 'ABEV3.SA', name: 'Ambev', category: 'bebidas' },
  { symbol: 'MGLU3.SA', name: 'Magalu', category: 'varejo' },
  { symbol: 'B3SA3.SA', name: 'Brasil', category: 'aviacao' },
  { symbol: 'GGBR4.SA', name: 'Gerdau', category: 'siderurgia' }
];

/**
 * Busca dados de ações usando API simulada (para testes)
 */
export const fetchStockData = async () => {
  try {
    // Verificar cache
    const now = Date.now();
    if (stockCache.timestamp && (now - stockCache.timestamp) < stockCache.expiry) {
      console.log('Retornando dados de ações do cache');
      return stockCache.data;
    }

    // Dados simulados com variação realista
    const mockStockData = BRAZILIAN_STOCKS.map(stock => {
      const basePrice = Math.random() * 100 + 20; // Preço entre R$20-120
      const change = (Math.random() - 0.5) * 10; // Variação entre -5% e +5%
      const changePercent = (change / basePrice) * 100;
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        category: stock.category,
        price: basePrice.toFixed(2),
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
        volume: Math.floor(Math.random() * 1000000) + 100000,
        lastUpdate: new Date().toISOString(),
        trend: changePercent > 0 ? 'up' : 'down'
      };
    });

    // Atualizar cache
    stockCache = {
      data: mockStockData,
      timestamp: now,
      expiry: 5 * 60 * 1000 // 5 minutos
    };

    return mockStockData;
  } catch (error) {
    console.log('Erro ao buscar dados de ações:', error);
    return [];
  }
};

/**
 * Busca dados específicos de uma ação
 */
export const fetchStockDetail = async (symbol) => {
  try {
    const allStocks = await fetchStockData();
    return allStocks.find(stock => stock.symbol === symbol) || null;
  } catch (error) {
    console.log('Erro ao buscar detalhe da ação:', error);
    return null;
  }
};

/**
 * Formata o valor monetário
 */
export const formatCurrency = (value) => {
  return `R$ ${parseFloat(value).toFixed(2)}`;
};

/**
 * Formata a variação percentual
 */
export const formatPercent = (value) => {
  const numValue = parseFloat(value);
  const sign = numValue >= 0 ? '+' : '';
  return `${sign}${numValue.toFixed(2)}%`;
};

/**
 * Retorna cor baseada na variação
 */
export const getTrendColor = (trend) => {
  return trend === 'up' ? '#10B981' : '#EF4444'; // verde para alta, vermelho para baixa
};

/**
 * Limpa o cache de ações
 */
export const clearStockCache = () => {
  stockCache = {
    data: [],
    timestamp: null,
    expiry: 5 * 60 * 1000
  };
};

/**
 * Abre link para mais informações sobre a ação
 */
export const openStockLink = async (symbol) => {
  try {
    const { Linking } = require('react-native');
    const url = `https://www.google.com/finance/quote/${symbol}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log('Não foi possível abrir a URL:', url);
    }
  } catch (error) {
    console.log('Erro ao abrir link da ação:', error);
  }
};

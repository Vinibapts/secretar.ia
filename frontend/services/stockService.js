import axios from 'axios';

// Configuração da API de ações (usando Alpha Vantage como alternativa gratuita)
const STOCK_API_KEY = 'demo'; // Chave demo para testes
const STOCK_API_BASE_URL = 'https://www.alphavantage.co/query';

// Cache local para dados de ações
let stockCache = {
  data: [],
  timestamp: null,
  expiry: 30 * 1000 // 30 segundos para atualização rápida
};

// Controle de atualização automática
let autoRefreshInterval = null;

/**
 * Inicia atualização automática de ações
 */
export const startStockAutoRefresh = (callback, intervalSeconds = 30) => {
  // Limpar intervalo anterior se existir
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  // Configurar novo intervalo
  const intervalMs = intervalSeconds * 1000;
  autoRefreshInterval = setInterval(async () => {
    try {
      const freshStocks = await fetchStockData();
      callback(freshStocks);
    } catch (error) {
      console.log('Erro no auto-refresh de ações:', error);
    }
  }, intervalMs);

  console.log(`Auto-refresh de ações iniciado: ${intervalSeconds} segundos`);
};

/**
 * Para atualização automática de ações
 */
export const stopStockAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('Auto-refresh de ações parado');
  }
};

/**
 * Gera dados dinâmicos de ações com variação real-time
 */
export const generateDynamicStockData = () => {
  const baseStocks = [
    { symbol: 'PETR4.SA', name: 'Petrobras', category: 'petróleo', basePrice: 35.50 },
    { symbol: 'VALE3.SA', name: 'Vale', category: 'mineração', basePrice: 68.20 },
    { symbol: 'ITUB4.SA', name: 'Itaú', category: 'financeiro', basePrice: 32.80 },
    { symbol: 'BBDC4.SA', name: 'Bradesco', category: 'financeiro', basePrice: 24.15 },
    { symbol: 'WEGE3.SA', name: 'Weg', category: 'industrial', basePrice: 42.30 },
    { symbol: 'ABEV3.SA', name: 'Ambev', category: 'bebidas', basePrice: 18.90 },
    { symbol: 'MGLU3.SA', name: 'Magalu', category: 'varejo', basePrice: 25.40 },
    { symbol: 'B3SA3.SA', name: 'Brasil', category: 'aviacao', basePrice: 12.75 },
    { symbol: 'GGBR4.SA', name: 'Gerdau', category: 'siderurgia', basePrice: 28.60 }
  ];

  // Gerar variação dinâmica
  return baseStocks.map(stock => {
    const randomFactor = Math.random() * 0.1 - 0.05; // ±5% de variação
    const currentPrice = stock.basePrice * (1 + randomFactor);
    const change = currentPrice - stock.basePrice;
    const changePercent = (change / stock.basePrice) * 100;
    
    return {
      ...stock,
      price: currentPrice.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      lastUpdate: new Date().toISOString(),
      trend: changePercent > 0 ? 'up' : 'down',
      volatility: Math.random() > 0.7 ? 'high' : 'normal', // 30% chance de alta volatilidade
      priceHistory: generatePriceHistory(stock.basePrice, currentPrice) // Histórico para gráficos
    };
  });
};

/**
 * Gera histórico de preços para simulação
 */
const generatePriceHistory = (basePrice, currentPrice) => {
  const history = [];
  const points = 20; // Últimos 20 pontos
  
  for (let i = 0; i < points; i++) {
    const progress = i / points;
    const price = basePrice + (currentPrice - basePrice) * progress + (Math.random() - 0.5) * 2;
    history.push({
      time: new Date(Date.now() - (points - i) * 60000).toISOString(), // Cada ponto = 1 minuto
      price: price.toFixed(2)
    });
  }
  
  return history;
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
 * Busca dados de ações usando API simulada - VERSÃO DINÂMICA
 */
export const fetchStockData = async () => {
  try {
    // Verificar cache (reduzido para 30 segundos)
    const now = Date.now();
    if (stockCache.timestamp && (now - stockCache.timestamp) < stockCache.expiry) {
      console.log('Retornando dados de ações do cache');
      return stockCache.data;
    }

    // Gerar dados dinâmicos para simulação real-time
    const dynamicStockData = generateDynamicStockData();

    // Atualizar cache
    stockCache = {
      data: dynamicStockData,
      timestamp: now,
      expiry: 30 * 1000 // 30 segundos para atualizações rápidas
    };

    return dynamicStockData;
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

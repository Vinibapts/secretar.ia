import axios from 'axios';

// Configuração da API de câmbio (usando exchangerate-api.com como alternativa gratuita)
const CURRENCY_API_KEY = 'demo'; // Chave demo para testes
const CURRENCY_API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

// Cache local para dados de moedas
let currencyCache = {
  data: [],
  timestamp: null,
  expiry: 60 * 1000 // 1 minuto para atualização rápida
};

// Controle de atualização automática
let autoRefreshInterval = null;

/**
 * Inicia atualização automática de moedas
 */
export const startCurrencyAutoRefresh = (callback, intervalSeconds = 60) => {
  // Limpar intervalo anterior se existir
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  // Configurar novo intervalo
  const intervalMs = intervalSeconds * 1000;
  autoRefreshInterval = setInterval(async () => {
    try {
      const freshCurrencies = await fetchCurrencyData();
      callback(freshCurrencies);
    } catch (error) {
      console.log('Erro no auto-refresh de moedas:', error);
    }
  }, intervalMs);

  console.log(`Auto-refresh de moedas iniciado: ${intervalSeconds} segundos`);
};

/**
 * Para atualização automática de moedas
 */
export const stopCurrencyAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('Auto-refresh de moedas parado');
  }
};

/**
 * Gera dados dinâmicos de moedas com variação real-time
 */
export const generateDynamicCurrencyData = () => {
  const baseCurrencies = [
    { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸', baseRate: 5.45 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', baseRate: 5.90 },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧', baseRate: 6.80 },
    { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵', baseRate: 0.036 },
    { code: 'CHF', name: 'Franco Suíço', symbol: 'Fr', flag: '🇨🇭', baseRate: 6.20 },
    { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦', baseRate: 4.00 },
    { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺', baseRate: 3.50 },
    { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳', baseRate: 0.75 },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '₿', baseRate: 350000 },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: 'Ξ', baseRate: 15000 }
  ];

  // Gerar variação dinâmica
  return baseCurrencies.map(currency => {
    const randomFactor = Math.random() * 0.04 - 0.02; // ±2% de variação
    const currentRate = currency.baseRate * (1 + randomFactor);
    const change = currentRate - currency.baseRate;
    const changePercent = (change / currency.baseRate) * 100;
    
    return {
      ...currency,
      rate: currentRate.toFixed(4),
      change: change.toFixed(4),
      changePercent: changePercent.toFixed(2),
      lastUpdate: new Date().toISOString(),
      trend: changePercent > 0 ? 'up' : 'down',
      volatility: Math.random() > 0.8 ? 'high' : 'normal', // 20% chance de alta volatilidade
      rateHistory: generateRateHistory(currency.baseRate, currentRate) // Histórico para gráficos
    };
  });
};

/**
 * Gera histórico de taxas para simulação
 */
const generateRateHistory = (baseRate, currentRate) => {
  const history = [];
  const points = 20; // Últimos 20 pontos
  
  for (let i = 0; i < points; i++) {
    const progress = i / points;
    const rate = baseRate + (currentRate - baseRate) * progress + (Math.random() - 0.5) * 0.1;
    history.push({
      time: new Date(Date.now() - (points - i) * 60000).toISOString(), // Cada ponto = 1 minuto
      rate: rate.toFixed(4)
    });
  }
  
  return history;
};

/**
 * Lista de moedas principais para monitoramento
 */
const MAIN_CURRENCIES = [
  { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: 'Ξ' }
];

/**
 * Busca dados de câmbio usando API simulada - VERSÃO DINÂMICA
 */
export const fetchCurrencyData = async () => {
  try {
    // Verificar cache (reduzido para 1 minuto)
    const now = Date.now();
    if (currencyCache.timestamp && (now - currencyCache.timestamp) < currencyCache.expiry) {
      console.log('Retornando dados de câmbio do cache');
      return currencyCache.data;
    }

    // Gerar dados dinâmicos para simulação real-time
    const dynamicCurrencyData = generateDynamicCurrencyData();

    // Atualizar cache
    currencyCache = {
      data: dynamicCurrencyData,
      timestamp: now,
      expiry: 60 * 1000 // 1 minuto para atualizações rápidas
    };

    return dynamicCurrencyData;
  } catch (error) {
    console.log('Erro ao buscar dados de câmbio:', error);
    return [];
  }
};

/**
 * Busca dados específicos de uma moeda
 */
export const fetchCurrencyDetail = async (code) => {
  try {
    const allCurrencies = await fetchCurrencyData();
    return allCurrencies.find(currency => currency.code === code) || null;
  } catch (error) {
    console.log('Erro ao buscar detalhe da moeda:', error);
    return null;
  }
};

/**
 * Formata o valor monetário
 */
export const formatCurrencyValue = (value, symbol = '') => {
  const numValue = parseFloat(value);
  if (numValue >= 1000) {
    return `${symbol}${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${symbol}${numValue.toFixed(4)}`;
};

/**
 * Formata a variação percentual
 */
export const formatCurrencyPercent = (value) => {
  const numValue = parseFloat(value);
  const sign = numValue >= 0 ? '+' : '';
  return `${sign}${numValue.toFixed(2)}%`;
};

/**
 * Retorna cor baseada na variação
 */
export const getCurrencyTrendColor = (trend) => {
  return trend === 'up' ? '#10B981' : '#EF4444'; // verde para alta, vermelho para baixa
};

/**
 * Limpa o cache de moedas
 */
export const clearCurrencyCache = () => {
  currencyCache = {
    data: [],
    timestamp: null,
    expiry: 10 * 60 * 1000
  };
};

/**
 * Abre link para mais informações sobre a moeda
 */
export const openCurrencyLink = async (code) => {
  try {
    const { Linking } = require('react-native');
    const url = `https://www.google.com/search?q=${code}+para+BRL`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log('Não foi possível abrir a URL:', url);
    }
  } catch (error) {
    console.log('Erro ao abrir link da moeda:', error);
  }
};

/**
 * Converte valor entre moedas
 */
export const convertCurrency = (amount, fromCode, toCode, rates) => {
  const fromRate = rates.find(r => r.code === fromCode)?.rate || 1;
  const toRate = rates.find(r => r.code === toCode)?.rate || 1;
  
  // Converter de moeda origem para BRL, depois para moeda destino
  const inBRL = amount * parseFloat(fromRate);
  const result = inBRL / parseFloat(toRate);
  
  return result.toFixed(2);
};

import axios from 'axios';

// Configuração da API de câmbio (usando exchangerate-api.com como alternativa gratuita)
const CURRENCY_API_KEY = 'demo'; // Chave demo para testes
const CURRENCY_API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

// Cache local para dados de moedas
let currencyCache = {
  data: [],
  timestamp: null,
  expiry: 10 * 60 * 1000 // 10 minutos
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
 * Busca dados de câmbio usando API simulada (para testes)
 */
export const fetchCurrencyData = async () => {
  try {
    // Verificar cache
    const now = Date.now();
    if (currencyCache.timestamp && (now - currencyCache.timestamp) < currencyCache.expiry) {
      console.log('Retornando dados de câmbio do cache');
      return currencyCache.data;
    }

    // Dados simulados com variação realista em relação ao Real
    const mockCurrencyData = MAIN_CURRENCIES.map(currency => {
      let rate, change, changePercent;
      
      // Taxas de câmbio simuladas (1 moeda = X reais)
      switch (currency.code) {
        case 'USD':
          rate = 5.45 + (Math.random() - 0.5) * 0.2; // ~5.45 BRL
          break;
        case 'EUR':
          rate = 5.90 + (Math.random() - 0.5) * 0.3; // ~5.90 BRL
          break;
        case 'GBP':
          rate = 6.80 + (Math.random() - 0.5) * 0.4; // ~6.80 BRL
          break;
        case 'JPY':
          rate = 0.036 + (Math.random() - 0.5) * 0.002; // ~0.036 BRL
          break;
        case 'CHF':
          rate = 6.20 + (Math.random() - 0.5) * 0.3; // ~6.20 BRL
          break;
        case 'CAD':
          rate = 4.00 + (Math.random() - 0.5) * 0.2; // ~4.00 BRL
          break;
        case 'AUD':
          rate = 3.50 + (Math.random() - 0.5) * 0.2; // ~3.50 BRL
          break;
        case 'CNY':
          rate = 0.75 + (Math.random() - 0.5) * 0.05; // ~0.75 BRL
          break;
        case 'BTC':
          rate = 350000 + (Math.random() - 0.5) * 20000; // ~350k BRL
          break;
        case 'ETH':
          rate = 15000 + (Math.random() - 0.5) * 1000; // ~15k BRL
          break;
        default:
          rate = 1 + Math.random();
      }
      
      change = (Math.random() - 0.5) * 0.1; // Variação entre -5% e +5%
      changePercent = (change / rate) * 100;
      
      return {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        flag: currency.flag,
        rate: rate.toFixed(4),
        change: change.toFixed(4),
        changePercent: changePercent.toFixed(2),
        lastUpdate: new Date().toISOString(),
        trend: changePercent > 0 ? 'up' : 'down'
      };
    });

    // Atualizar cache
    currencyCache = {
      data: mockCurrencyData,
      timestamp: now,
      expiry: 10 * 60 * 1000 // 10 minutos
    };

    return mockCurrencyData;
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

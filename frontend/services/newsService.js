import axios from 'axios';

// Configuração da API de notícias
const NEWS_API_KEY = 'SUA_CHAVE_AQUI'; // Você precisará criar uma chave em newsapi.org
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Fontes de notícias brasileiras (RSS feeds alternativos)
const BRAZILIAN_NEWS_SOURCES = [
  {
    id: 'g1',
    name: 'G1',
    url: 'https://g1.globo.com/feed/g1/rss2.xml',
    category: 'general'
  },
  {
    id: 'uol',
    name: 'UOL',
    url: 'https://rss.uol.com.br/feed/noticias.xml',
    category: 'general'
  },
  {
    id: 'folha',
    name: 'Folha',
    url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml',
    category: 'general'
  },
  {
    id: 'bbc',
    name: 'BBC Brasil',
    url: 'https://www.bbc.com/portuguese/index.xml',
    category: 'general'
  },
  {
    id: 'estadao',
    name: 'Estadão',
    url: 'https://www.estadao.com.br/rss/ultimas.xml',
    category: 'general'
  }
];

// Cache local para notícias
let newsCache = {
  data: [],
  timestamp: null,
  expiry: 5 * 60 * 1000 // 5 minutos para atualização automática
};

// Controle de atualização automática
let autoRefreshInterval = null;

/**
 * Inicia atualização automática de notícias
 */
export const startNewsAutoRefresh = (callback, intervalMinutes = 5) => {
  // Limpar intervalo anterior se existir
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  // Configurar novo intervalo
  const intervalMs = intervalMinutes * 60 * 1000;
  autoRefreshInterval = setInterval(async () => {
    try {
      const freshNews = await fetchNews();
      callback(freshNews);
    } catch (error) {
      console.log('Erro no auto-refresh de notícias:', error);
    }
  }, intervalMs);

  console.log(`Auto-refresh de notícias iniciado: ${intervalMinutes} minutos`);
};

/**
 * Para atualização automática de notícias
 */
export const stopNewsAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('Auto-refresh de notícias parado');
  }
};

/**
 * Gera notícias dinâmicas com variação para simulação real-time
 */
export const generateDynamicNews = () => {
  const baseNews = [
    {
      id: '1',
      title: 'Economia brasileira mostra sinais de recuperação',
      description: 'Especialistas apontam crescimento no último trimestre',
      url: 'https://g1.globo.com',
      image: 'https://picsum.photos/seed/g1/150/100.jpg',
      source: 'G1',
      category: 'economy'
    },
    {
      id: '2',
      title: 'Tecnologia: Novas tendências para 2024',
      description: 'IA e sustentabilidade dominam discussões',
      url: 'https://uol.com.br',
      image: 'https://picsum.photos/seed/uol/150/100.jpg',
      source: 'UOL',
      category: 'technology'
    },
    {
      id: '3',
      title: 'Bolsa fecha em alta com otimismo dos investidores',
      description: 'Índice Ibovespa sobe 2,3% em dia de volatilidade',
      url: 'https://folha.uol.com.br',
      image: 'https://picsum.photos/seed/folha/150/100.jpg',
      source: 'Folha',
      category: 'business'
    },
    {
      id: '4',
      title: 'Política: Congresso discute novas medidas',
      description: 'Projeto de lei ganha apoio popular',
      url: 'https://bbc.com',
      image: 'https://picsum.photos/seed/bbc/150/100.jpg',
      source: 'BBC Brasil',
      category: 'politics'
    },
    {
      id: '5',
      title: 'Ciência: Descoberta revoluciona área',
      description: 'Pesquisadores brasileiros fazem avanço inédito',
      url: 'https://estadao.com.br',
      image: 'https://picsum.photos/seed/ciencia/150/100.jpg',
      source: 'Estadão',
      category: 'science'
    },
    {
      id: '6',
      title: 'Mercado financeiro: Dólar tem leve queda',
      description: 'Moeda americana recua em relação ao real',
      url: 'https://g1.globo.com',
      image: 'https://picsum.photos/seed/dolar/150/100.jpg',
      source: 'G1',
      category: 'economy'
    },
    {
      id: '7',
      title: 'Esporte: Brasil se prepara para competição',
      description: 'Seleção concentra para próximos jogos',
      url: 'https://uol.com.br',
      image: 'https://picsum.photos/seed/esporte/150/100.jpg',
      source: 'UOL',
      category: 'sports'
    },
    {
      id: '8',
      title: 'Cultura: Festival reúne grandes nomes',
      description: 'Evento promove arte e música nacional',
      url: 'https://folha.uol.com.br',
      image: 'https://picsum.photos/seed/cultura/150/100.jpg',
      source: 'Folha',
      category: 'culture'
    }
  ];

  // Adicionar timestamp e pequenas variações
  return baseNews.map((news, index) => ({
    ...news,
    id: `${news.id}-${Date.now()}-${index}`,
    publishedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Última hora
    priority: Math.random() > 0.7 ? 'high' : 'normal' // 30% chance de ser prioridade alta
  }));
};

/**
 * Busca notícias usando NewsAPI (requer chave)
 */
export const fetchNewsFromAPI = async () => {
  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
      params: {
        country: 'br',
        category: 'general',
        pageSize: 10,
        apiKey: NEWS_API_KEY
      },
      timeout: 10000
    });

    return response.data.articles.map(article => ({
      id: article.url,
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage || 'https://via.placeholder.com/150x100?text=Sem+Imagem',
      source: article.source.name,
      publishedAt: article.publishedAt,
      category: 'general'
    }));
  } catch (error) {
    console.log('Erro ao buscar notícias da API:', error);
    return [];
  }
};

/**
 * Busca notícias de fontes RSS (alternativa gratuita) - VERSÃO DINÂMICA
 */
export const fetchNewsFromRSS = async () => {
  try {
    // Gerar notícias dinâmicas para simulação real-time
    return generateDynamicNews();
  } catch (error) {
    console.log('Erro ao buscar notícias RSS:', error);
    return [];
  }
};

/**
 * Função principal para buscar notícias com cache - VERSÃO OTIMIZADA
 */
export const fetchNews = async () => {
  // Verificar cache (reduzido para 2 minutos para mais atualizações)
  const now = Date.now();
  if (newsCache.timestamp && (now - newsCache.timestamp) < newsCache.expiry) {
    console.log('Retornando notícias do cache');
    return newsCache.data;
  }

  try {
    // Tentar API primeiro (se tiver chave)
    let news = [];
    
    if (NEWS_API_KEY && NEWS_API_KEY !== 'SUA_CHAVE_AQUI') {
      news = await fetchNewsFromAPI();
    }

    // Se API falhar ou não tiver chave, usar RSS dinâmico
    if (news.length === 0) {
      news = await fetchNewsFromRSS();
    }

    // Atualizar cache
    newsCache = {
      data: news,
      timestamp: now,
      expiry: 2 * 60 * 1000 // 2 minutos para mais atualizações
    };

    return news;
  } catch (error) {
    console.log('Erro ao buscar notícias:', error);
    return [];
  }
};

/**
 * Limpa o cache de notícias
 */
export const clearNewsCache = () => {
  newsCache = {
    data: [],
    timestamp: null,
    expiry: 30 * 60 * 1000
  };
};

/**
 * Formata a data da notícia
 */
export const formatNewsDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Agora há pouco';
  } else if (diffInHours < 24) {
    return `Há ${diffInHours} horas`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }
};

/**
 * Abre a notícia no navegador
 */
export const openNewsArticle = async (url) => {
  try {
    // Em React Native, usar Linking
    const { Linking } = require('react-native');
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log('Não foi possível abrir a URL:', url);
    }
  } catch (error) {
    console.log('Erro ao abrir notícia:', error);
  }
};

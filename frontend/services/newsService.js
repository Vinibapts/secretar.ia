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
  expiry: 30 * 60 * 1000 // 30 minutos
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
 * Busca notícias de fontes RSS (alternativa gratuita)
 */
export const fetchNewsFromRSS = async () => {
  try {
    // Usar URLs de imagens que funcionam em React Native
    const mockNews = [
      {
        id: '1',
        title: 'Economia brasileira mostra sinais de recuperação',
        description: 'Especialistas apontam crescimento no último trimestre',
        url: 'https://g1.globo.com',
        image: 'https://picsum.photos/seed/g1/150/100.jpg',
        source: 'G1',
        publishedAt: new Date().toISOString(),
        category: 'economy'
      },
      {
        id: '2',
        title: 'Tecnologia: Novas tendências para 2024',
        description: 'IA e sustentabilidade dominam discussões',
        url: 'https://uol.com.br',
        image: 'https://picsum.photos/seed/uol/150/100.jpg',
        source: 'UOL',
        publishedAt: new Date().toISOString(),
        category: 'technology'
      },
      {
        id: '3',
        title: 'Saúde: Dicas para manter o bem-estar',
        description: 'Especialistas compartilham hábitos saudáveis',
        url: 'https://folha.uol.com.br',
        image: 'https://picsum.photos/seed/folha/150/100.jpg',
        source: 'Folha',
        publishedAt: new Date().toISOString(),
        category: 'health'
      },
      {
        id: '4',
        title: 'Política: Congresso discute novas medidas',
        description: 'Projeto de lei ganha apoio popular',
        url: 'https://bbc.com',
        image: 'https://picsum.photos/seed/bbc/150/100.jpg',
        source: 'BBC Brasil',
        publishedAt: new Date().toISOString(),
        category: 'politics'
      },
      {
        id: '5',
        title: 'Esporte: Brasil se prepara para competição',
        description: 'Seleção concentra para próximos jogos',
        url: 'https://estadao.com.br',
        image: 'https://picsum.photos/seed/estadao/150/100.jpg',
        source: 'Estadão',
        publishedAt: new Date().toISOString(),
        category: 'sports'
      },
      {
        id: '6',
        title: 'Ciência: Descoberta revoluciona área',
        description: 'Pesquisadores brasileiros fazem avanço inédito',
        url: 'https://g1.globo.com',
        image: 'https://picsum.photos/seed/ciencia/150/100.jpg',
        source: 'G1',
        publishedAt: new Date().toISOString(),
        category: 'science'
      },
      {
        id: '7',
        title: 'Cultura: Festival reúne grandes nomes',
        description: 'Evento promove arte e música nacional',
        url: 'https://uol.com.br',
        image: 'https://picsum.photos/seed/cultura/150/100.jpg',
        source: 'UOL',
        publishedAt: new Date().toISOString(),
        category: 'culture'
      },
      {
        id: '8',
        title: 'Negócios: Mercado aquece este mês',
        description: 'Bolsa fecha em alta com novidades',
        url: 'https://folha.uol.com.br',
        image: 'https://picsum.photos/seed/negocios/150/100.jpg',
        source: 'Folha',
        publishedAt: new Date().toISOString(),
        category: 'business'
      }
    ];

    return mockNews;
  } catch (error) {
    console.log('Erro ao buscar notícias RSS:', error);
    return [];
  }
};

/**
 * Função principal para buscar notícias com cache
 */
export const fetchNews = async () => {
  // Verificar cache
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

    // Se API falhar ou não tiver chave, usar RSS
    if (news.length === 0) {
      news = await fetchNewsFromRSS();
    }

    // Atualizar cache
    newsCache = {
      data: news,
      timestamp: now,
      expiry: 30 * 60 * 1000 // 30 minutos
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

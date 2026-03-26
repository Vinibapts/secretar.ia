import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchNews } from '../services/newsService';
import AnimatedNewsCard from './AnimatedNewsCard';

export default function AnimatedNewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Auto-scroll animation sempre ativo
  const scrollX = useRef(new Animated.Value(0)).current;

  // Carregar notícias iniciais
  const loadNews = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);

      const newsData = await fetchNews();
      console.log(' Notícias carregadas:', newsData?.length || 0);
      setNews(newsData);
      setLastUpdate(new Date());
      
      // Animação de entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.log('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, fadeAnim]);

  // Auto-scroll contínuo sempre ativo
  useEffect(() => {
    if (news.length === 0) return;

    let scrollPosition = 0;
    const scrollWidth = 170 * news.length; // Largura total das notícias
    const screenWidth = 375; // Largura da tela (aproximada)
    const maxScroll = Math.max(0, scrollWidth - screenWidth);

    const scrollInterval = setInterval(() => {
      // Incrementar posição
      scrollPosition += 2; // Velocidade do scroll
      
      // Se chegou ao final, voltar ao início
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }
      
      // Aplicar animação via translateX
      slideAnim.setValue(-scrollPosition);
    }, 50); // 50ms = 20fps

    return () => clearInterval(scrollInterval);
  }, [news.length, slideAnim]);

  // Iniciar carregamento e auto-refresh
  useEffect(() => {
    loadNews();
    
    // Auto-refresh a cada 2 minutos
    const refreshInterval = setInterval(() => {
      loadNews();
    }, 120000); // 2 minutos

    return () => clearInterval(refreshInterval);
  }, [loadNews]);

  // Formatar tempo da última atualização
  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    
    if (diff < 60) return 'Agora';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    return `Há ${Math.floor(diff / 3600)} h`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>📰 Notícias do Dia</Text>
          <View style={styles.updateInfo}>
            <Ionicons 
              name="sync-circle" 
              size={14} 
              color="#10B981" 
            />
            <Text style={styles.updateText}>
              {formatLastUpdate()}
            </Text>
          </View>
        </View>
      </View>

      {loading && news.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando notícias...</Text>
        </View>
      ) : news.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="newspaper-outline" size={36} color="#7B8FA6" style={{ opacity: 0.4 }} />
          <Text style={styles.emptyText}>Nenhuma notícia disponível</Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          <View 
            style={[styles.scrollView, styles.scrollContent]}
            pointerEvents="none" // NÃO interceptar eventos de toque
          >
            {news.map((article, index) => (
              <AnimatedNewsCard
                key={article.id}
                article={article}
                index={index}
              />
            ))}
          </View>
        </Animated.View>
      )}

      <View style={styles.autoScrollIndicator}>
        <View style={styles.pulseDot} />
        <Text style={styles.autoScrollText}>Auto-scroll: Ativo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    zIndex: 1, // Baixo z-index para não bloquear nada
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  updateText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flexDirection: 'row',
    width: '100%',
  },
  scrollContent: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  loadingContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  retryText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  autoScrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  autoScrollText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
});

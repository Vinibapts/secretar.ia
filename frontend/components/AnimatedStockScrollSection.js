import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchStockData, startStockAutoRefresh, stopStockAutoRefresh } from '../services/stockService';
import AnimatedStockCard from './AnimatedStockCard';

const AnimatedStockScrollSection = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [previousStocks, setPreviousStocks] = useState([]);
  
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Carregar dados iniciais
  const loadStocks = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);

      const freshStocks = await fetchStockData();
      
      // Manter dados anteriores para comparação
      setPreviousStocks(stocks.length > 0 ? [...stocks] : []);
      setStocks(freshStocks);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.log('Erro ao carregar ações:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, stocks]);

  // Auto-scroll contínuo sempre ativo
  useEffect(() => {
    if (stocks.length === 0 || !scrollRef.current) return;

    let scrollPosition = 0;
    const scrollWidth = 180 * stocks.length; // Largura total das ações
    const screenWidth = 375; // Largura da tela (aproximada)
    const maxScroll = Math.max(0, scrollWidth - screenWidth);

    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        // Incrementar posição
        scrollPosition += 2; // Velocidade do scroll
        
        // Se chegou ao final, voltar ao início
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        // Aplicar scroll
        scrollRef.current.scrollTo({ x: scrollPosition, animated: false });
      }
    }, 50); // 50ms = 20fps

    return () => clearInterval(scrollInterval);
  }, [stocks.length]);

  // Iniciar auto-refresh sempre ativo
  useEffect(() => {
    loadStocks();
    
    // Callback para atualização automática
    const handleAutoRefresh = (freshStocks) => {
      setPreviousStocks(stocks.length > 0 ? [...stocks] : []);
      setStocks(freshStocks);
      setLastUpdate(new Date());
      
      // Animação sutil de atualização
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: 3, duration: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    };

    startStockAutoRefresh(handleAutoRefresh, 30); // 30 segundos sempre ativo

    return () => {
      stopStockAutoRefresh();
    };
  }, [loadStocks, stocks, slideAnim]);

  // Formatar tempo da última atualização
  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    
    if (diff < 60) return 'Agora';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    return `Há ${Math.floor(diff / 3600)} h`;
  };

  // Encontrar dados anteriores para comparação
  const getPreviousStock = (currentStock) => {
    return previousStocks.find(prev => prev.symbol === currentStock.symbol);
  };

  // Calcular estatísticas do mercado (mantido para uso futuro, mas não exibido)
  const getMarketStats = () => {
    if (stocks.length === 0) return { up: 0, down: 0, total: 0 };
    
    const up = stocks.filter(s => s.trend === 'up').length;
    const down = stocks.filter(s => s.trend === 'down').length;
    
    return { up, down, total: stocks.length };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>📈 Bolsa de Valores</Text>
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

      {loading && stocks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando ações...</Text>
        </View>
      ) : stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up-outline" size={36} color="#7B8FA6" style={{ opacity: 0.4 }} />
          <Text style={styles.emptyText}>Nenhuma ação disponível</Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={false} // Desabilitar scroll manual - 100% automático
          >
            {stocks.map((stock, index) => (
              <AnimatedStockCard
                key={stock.symbol}
                stock={stock}
                index={index}
                previousStock={getPreviousStock(stock)}
              />
            ))}
          </ScrollView>
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
    color: '#1A2233',
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statHighlight: {
    borderLeftWidth: 2,
    borderLeftColor: '#10B981',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2233',
  },
  statLabel: {
    fontSize: 10,
    color: '#7B8FA6',
    marginTop: 2,
  },
  scrollView: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingRight: 20,
  },
  loadingContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  loadingText: {
    color: '#7B8FA6',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7B8FA6',
    fontSize: 14,
    marginTop: 10,
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

export default AnimatedStockScrollSection;

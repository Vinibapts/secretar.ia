import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchStockData, startStockAutoRefresh, stopStockAutoRefresh } from '../services/stockService';
import AnimatedStockCard from './AnimatedStockCard';

const AnimatedStockSection = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [previousStocks, setPreviousStocks] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Carregar dados iniciais
  const loadStocks = useCallback(async (isRefresh = false) => {
    if (loading && !isRefresh) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
        // Animação de refresh
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      } else {
        setLoading(true);
      }

      const freshStocks = await fetchStockData();
      
      // Manter dados anteriores para comparação
      setPreviousStocks(stocks.length > 0 ? [...stocks] : []);
      setStocks(freshStocks);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.log('Erro ao carregar ações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, stocks, fadeAnim]);

  // Iniciar auto-refresh
  useEffect(() => {
    if (autoRefreshEnabled) {
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

      startStockAutoRefresh(handleAutoRefresh, 30); // 30 segundos

      return () => {
        stopStockAutoRefresh();
      };
    }
  }, [autoRefreshEnabled, loadStocks, stocks, slideAnim]);

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

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

  // Renderizar card de ação
  const renderStockCard = ({ item, index }) => (
    <AnimatedStockCard
      stock={item}
      index={index}
      previousStock={getPreviousStock(item)}
    />
  );

  // Calcular estatísticas do mercado
  const getMarketStats = () => {
    if (stocks.length === 0) return { up: 0, down: 0, total: 0 };
    
    const up = stocks.filter(s => s.trend === 'up').length;
    const down = stocks.filter(s => s.trend === 'down').length;
    
    return { up, down, total: stocks.length };
  };

  const stats = getMarketStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>📈 Bolsa de Valores</Text>
          <View style={styles.updateInfo}>
            <Ionicons 
              name={autoRefreshEnabled ? "sync-circle" : "sync-circle-outline"} 
              size={14} 
              color={autoRefreshEnabled ? "#10B981" : "#7B8FA6"} 
            />
            <Text style={[styles.updateText, autoRefreshEnabled && styles.updateTextActive]}>
              {formatLastUpdate()}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => loadStocks(true)} 
            style={[styles.refreshButton, refreshing && styles.refreshButtonActive]}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={16} 
              color={refreshing ? "#FFFFFF" : "#3B82F6"} 
              style={refreshing && { transform: [{ rotate: '360deg' }] }}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleAutoRefresh}
            style={[styles.autoRefreshButton, autoRefreshEnabled && styles.autoRefreshButtonActive]}
          >
            <Ionicons 
              name={autoRefreshEnabled ? "play-circle" : "play-circle-outline"} 
              size={16} 
              color={autoRefreshEnabled ? "#FFFFFF" : "#7B8FA6"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Estatísticas do Mercado */}
      {stocks.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.up}</Text>
            <Text style={styles.statLabel}>Altas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.down}</Text>
            <Text style={styles.statLabel}>Baixas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, styles.statHighlight]}>
            <Text style={styles.statNumber}>
              {stats.total > 0 ? Math.round((stats.up / stats.total) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Positivas</Text>
          </View>
        </View>
      )}

      {loading && stocks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando ações...</Text>
        </View>
      ) : stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up-outline" size={36} color="#7B8FA6" style={{ opacity: 0.4 }} />
          <Text style={styles.emptyText}>Nenhuma ação disponível</Text>
          <TouchableOpacity onPress={() => loadStocks(true)} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          <FlatList
            data={stocks}
            renderItem={renderStockCard}
            keyExtractor={(item) => item.symbol}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}

      {autoRefreshEnabled && (
        <View style={styles.autoRefreshIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.autoRefreshText}>Auto-refresh: 30 seg</Text>
        </View>
      )}
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
    color: '#7B8FA6',
    marginLeft: 4,
  },
  updateTextActive: {
    color: '#10B981',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonActive: {
    backgroundColor: '#3B82F6',
  },
  autoRefreshButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoRefreshButtonActive: {
    backgroundColor: '#10B981',
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
  listContent: {
    paddingBottom: 8,
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
  autoRefreshIndicator: {
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
  autoRefreshText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
});

export default AnimatedStockSection;

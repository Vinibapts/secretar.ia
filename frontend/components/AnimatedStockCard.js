import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatPercent, getTrendColor, openStockLink } from '../services/stockService';

const { width } = Dimensions.get('window');

const AnimatedStockCard = ({ stock, index, previousStock = null }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [priceAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const previousPriceRef = useRef(previousStock?.price || stock.price);
  const hasChanged = previousStock && previousStock.price !== stock.price;

  useEffect(() => {
    // Animação de entrada
    const startAnimation = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    startAnimation();

    // Reset para novas atualizações
    if (hasChanged) {
      // Animação de mudança de preço
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Animação do número
      const startValue = parseFloat(previousPriceRef.current);
      const endValue = parseFloat(stock.price);
      
      Animated.timing(priceAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
      
      previousPriceRef.current = stock.price;
    }
  }, [stock.price, hasChanged, index]);

  const handlePress = () => {
    // Feedback visual ao clicar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    openStockLink(stock.symbol);
  };

  const getAnimatedPrice = () => {
    if (!hasChanged) return stock.price;
    
    const startValue = parseFloat(previousPriceRef.current);
    const endValue = parseFloat(stock.price);
    const currentValue = startValue + (endValue - startValue) * priceAnim._value;
    
    return currentValue.toFixed(2);
  };

  const trendColor = getTrendColor(stock.trend);
  const isUp = stock.trend === 'up';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{stock.symbol}</Text>
            <Text style={styles.name}>{stock.name}</Text>
          </View>
          
          <View style={styles.trendContainer}>
            <Animated.View
              style={[
                styles.trendBadge,
                { backgroundColor: trendColor + '20', borderColor: trendColor },
              ]}
            >
              <Ionicons 
                name={isUp ? "trending-up" : "trending-down"} 
                size={12} 
                color={trendColor}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.currency}>R$</Text>
          <Animated.Text style={[styles.price, { color: trendColor }]}>
            {getAnimatedPrice()}
          </Animated.Text>
        </View>

        <View style={styles.changeContainer}>
          <View style={styles.changeRow}>
            <Ionicons 
              name={isUp ? "arrow-up" : "arrow-down"} 
              size={10} 
              color={trendColor}
            />
            <Text style={[styles.change, { color: trendColor }]}>
              {formatCurrency(stock.change)}
            </Text>
          </View>
          
          <Text style={[styles.percent, { color: trendColor }]}>
            {formatPercent(stock.changePercent)}
          </Text>
        </View>

        {stock.volatility === 'high' && (
          <View style={styles.volatilityBadge}>
            <Ionicons name="flash" size={8} color="#F59E0B" />
            <Text style={styles.volatilityText}>Alta</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.volume}>
            Vol: {(stock.volume / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.time}>
            {new Date(stock.lastUpdate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (width - 40) / 2 - 8, // 2 cards por linha
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2EAF4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2233',
  },
  name: {
    fontSize: 11,
    color: '#7B8FA6',
    marginTop: 2,
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currency: {
    fontSize: 12,
    color: '#7B8FA6',
    marginRight: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  changeContainer: {
    marginBottom: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  percent: {
    fontSize: 11,
    fontWeight: '500',
  },
  volatilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  volatilityText: {
    fontSize: 8,
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
  },
  volume: {
    fontSize: 9,
    color: '#7B8FA6',
  },
  time: {
    fontSize: 9,
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default AnimatedStockCard;

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrencyValue, formatCurrencyPercent, getCurrencyTrendColor, openCurrencyLink } from '../services/currencyService';

const { width } = Dimensions.get('window');

const AnimatedCurrencyCard = ({ currency, index, previousCurrency = null }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [rateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [flagAnim] = useState(new Animated.Value(1));
  
  const previousRateRef = useRef(previousCurrency?.rate || currency.rate);
  const hasChanged = previousCurrency && previousCurrency.rate !== currency.rate;

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
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(flagAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(flagAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    startAnimation();

    // Reset para novas atualizações
    if (hasChanged) {
      // Animação de mudança de taxa
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
      const startValue = parseFloat(previousRateRef.current);
      const endValue = parseFloat(currency.rate);
      
      Animated.timing(rateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
      
      previousRateRef.current = currency.rate;
    }
  }, [currency.rate, hasChanged, index]);

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

    openCurrencyLink(currency.code);
  };

  const getAnimatedRate = () => {
    if (!hasChanged) return currency.rate;
    
    const startValue = parseFloat(previousRateRef.current);
    const endValue = parseFloat(currency.rate);
    const currentValue = startValue + (endValue - startValue) * rateAnim._value;
    
    return currentValue.toFixed(4);
  };

  const trendColor = getCurrencyTrendColor(currency.trend);
  const isUp = currency.trend === 'up';
  const isCrypto = ['BTC', 'ETH'].includes(currency.code);

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
          <View style={styles.flagContainer}>
            <Animated.Text 
              style={[styles.flag, { transform: [{ scale: flagAnim }] }]}
            >
              {currency.flag}
            </Animated.Text>
          </View>
          
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{currency.symbol}</Text>
            <Text style={styles.code}>{currency.code}</Text>
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
                size={10} 
                color={trendColor}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.rateContainer}>
          <Text style={styles.currencyLabel}>BRL</Text>
          <Animated.Text style={[styles.rate, { color: trendColor }]}>
            {getAnimatedRate()}
          </Animated.Text>
        </View>

        <View style={styles.changeContainer}>
          <View style={styles.changeRow}>
            <Ionicons 
              name={isUp ? "arrow-up" : "arrow-down"} 
              size={8} 
              color={trendColor}
            />
            <Text style={[styles.change, { color: trendColor }]}>
              {formatCurrencyValue(currency.change)}
            </Text>
          </View>
          
          <Text style={[styles.percent, { color: trendColor }]}>
            {formatCurrencyPercent(currency.changePercent)}
          </Text>
        </View>

        {currency.volatility === 'high' && (
          <View style={styles.volatilityBadge}>
            <Ionicons name="flash" size={6} color="#F59E0B" />
            <Text style={styles.volatilityText}>Volátil</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.time}>
            {new Date(currency.lastUpdate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {isCrypto && (
          <View style={styles.cryptoBadge}>
            <Ionicons name="logo-bitcoin" size={8} color="#F59E0B" />
            <Text style={styles.cryptoText}>Crypto</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120, // Reduzido de (width - 40) / 2 - 8 para 120 fixo
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // Reduzido de 16 para 12
    padding: 12, // Reduzido de 16 para 12
    marginHorizontal: 4,
    marginVertical: 6, // Reduzido de 8 para 6
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2EAF4',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8, // Reduzido de 12 para 8
  },
  flagContainer: {
    width: 24, // Reduzido de 32 para 24
    height: 24, // Reduzido de 32 para 24
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 14, // Reduzido de 18 para 14
  },
  symbolContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 6, // Reduzido de 8 para 6
  },
  symbol: {
    fontSize: 12, // Reduzido de 16 para 12
    fontWeight: '700',
    color: '#1A2233',
  },
  code: {
    fontSize: 8, // Reduzido de 10 para 8
    color: '#7B8FA6',
    marginTop: 1, // Reduzido de 2 para 1
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendBadge: {
    width: 18, // Reduzido de 24 para 18
    height: 18, // Reduzido de 24 para 18
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6, // Reduzido de 8 para 6
  },
  currencyLabel: {
    fontSize: 8, // Reduzido de 10 para 8
    color: '#7B8FA6',
    marginRight: 2,
  },
  rate: {
    fontSize: 14, // Reduzido de 18 para 14
    fontWeight: '700',
  },
  changeContainer: {
    marginBottom: 6, // Reduzido de 8 para 6
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1, // Reduzido de 2 para 1
  },
  change: {
    fontSize: 9, // Reduzido de 11 para 9
    fontWeight: '600',
    marginLeft: 2, // Reduzido de 4 para 2
  },
  percent: {
    fontSize: 8, // Reduzido de 10 para 8
    fontWeight: '500',
  },
  volatilityBadge: {
    position: 'absolute',
    top: 8, // Reduzido de 12 para 8
    right: 8, // Reduzido de 12 para 8
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4, // Reduzido de 6 para 4
    paddingVertical: 1, // Reduzido de 2 para 1
    borderRadius: 6, // Reduzido de 8 para 6
  },
  volatilityText: {
    fontSize: 6, // Reduzido de 8 para 6
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 1, // Reduzido de 2 para 1
  },
  cryptoBadge: {
    position: 'absolute',
    bottom: 8, // Reduzido de 12 para 8
    right: 8, // Reduzido de 12 para 8
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4, // Reduzido de 6 para 4
    paddingVertical: 1, // Reduzido de 2 para 1
    borderRadius: 6, // Reduzido de 8 para 6
  },
  cryptoText: {
    fontSize: 6, // Reduzido de 8 para 6
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 1, // Reduzido de 2 para 1
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Alinhado à direita para economizar espaço
    alignItems: 'center',
    marginTop: 4, // Reduzido de 8 para 4
    paddingTop: 4, // Reduzido de 8 para 4
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
  },
  time: {
    fontSize: 7, // Reduzido de 9 para 7
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default AnimatedCurrencyCard;

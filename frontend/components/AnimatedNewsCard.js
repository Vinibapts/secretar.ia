import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatNewsDate, openNewsArticle } from '../services/newsService';

const { width } = Dimensions.get('window');

const AnimatedNewsCard = ({ article, index, isNew = false }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    // Animação de entrada
    const startAnimation = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100, // Stagger effect
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

    // Reset para novas notícias
    if (isNew) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.95);
      startAnimation();
    }
  }, [article.id, isNew]);

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

    openNewsArticle(article.url);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: article.image }} 
            style={styles.image}
            resizeMode="cover"
          />
          {article.priority === 'high' && (
            <View style={styles.priorityBadge}>
              <Ionicons name="flash" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.source}>{article.source}</Text>
            <Text style={styles.time}>{formatNewsDate(article.publishedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F4FF',
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 10,
    color: '#7B8FA6',
    fontWeight: '500',
  },
  time: {
    fontSize: 9,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default AnimatedNewsCard;

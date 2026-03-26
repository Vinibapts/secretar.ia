import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook simples para gerenciamento de tema
 * Apenas claro/escuro sem inteligência artificial
 */
export const useSimpleTheme = () => {
  const [theme, setTheme] = useState('light');

  // Carregar tema salvo ao iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };
    loadTheme();
  }, []);

  // Mudar tema
  const changeTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('selectedTheme', newTheme);
    } catch (error) {
      console.log('Erro ao salvar tema:', error);
    }
  };

  // Obter cores baseadas no tema
  const getColors = () => {
    if (theme === 'dark') {
      return {
        background: '#0F1420',
        surface: '#1A2233',
        surfaceLight: '#1E2D4A',
        text: '#F0F4FF',
        textMuted: '#7B8FA6',
        primary: '#3B82F6',
        primaryLight: '#1E3A5F',
        accent: '#8B5CF6',
        success: '#10B981',
        successLight: '#0D2E22',
        warning: '#F59E0B',
        warningLight: '#2E2208',
        danger: '#EF4444',
        dangerLight: '#2E0E0E',
        border: '#2A3A50',
        white: '#FFFFFF',
      };
    } else {
      return {
        background: '#F4F7FB',
        surface: '#FFFFFF',
        surfaceLight: '#EEF4FF',
        text: '#1A2233',
        textMuted: '#7B8FA6',
        primary: '#3B82F6',
        primaryLight: '#EFF6FF',
        accent: '#8B5CF6',
        success: '#10B981',
        successLight: '#ECFDF5',
        warning: '#F59E0B',
        warningLight: '#FFFBEB',
        danger: '#EF4444',
        dangerLight: '#FEF2F2',
        border: '#E2EAF4',
        white: '#FFFFFF',
      };
    }
  };

  return {
    theme,
    colors: getColors(),
    changeTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark',
  };
};

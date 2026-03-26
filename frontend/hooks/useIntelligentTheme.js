import { useState, useEffect, useCallback } from 'react';
import { AppState, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import intelligentThemeService from '../services/intelligentThemeService';

/**
 * Hook inteligente para gerenciamento de temas
 * Usa IA para detectar contexto e sugerir temas automaticamente
 */
export const useIntelligentTheme = () => {
  const [theme, setTheme] = useState('light');
  const [isIntelligentMode, setIsIntelligentMode] = useState(true);
  const [themeSource, setThemeSource] = useState('system');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Inicializa o serviço
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);

        // Carregar tema salvo
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        const savedMode = await AsyncStorage.getItem('intelligentThemeMode');

        // Inicializar serviço inteligente
        const initialTheme = await intelligentThemeService.initialize();
        
        // Configurar callback para mudanças
        intelligentThemeService.setThemeChangeCallback(handleThemeChange);

        // Definir modo inteligente
        const intelligentMode = savedMode !== null ? JSON.parse(savedMode) : true;
        setIsIntelligentMode(intelligentMode);

        // Aplicar tema inicial
        const finalTheme = savedTheme || initialTheme || 'light';
        setTheme(finalTheme);
        setThemeSource(savedTheme ? 'saved' : 'intelligent');

        // Carregar estatísticas
        setStats(intelligentThemeService.getUsageStats());

        console.log(`🎨 Tema inicializado: ${finalTheme} (Modo: ${intelligentMode ? 'Inteligente' : 'Manual'})`);
      } catch (error) {
        console.error('❌ Erro ao inicializar tema:', error);
        setTheme('light');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Monitora estado do app para coletar dados de contexto
  useEffect(() => {
    let appStateSubscription;
    let usageTimer;

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App em foreground - coletar dados de contexto
        updateContextData();
        
        // Se estiver em modo inteligente, reanalisar tema
        if (isIntelligentMode) {
          setTimeout(() => {
            intelligentThemeService.reanalyzeTheme();
          }, 1000);
        }
      }
    };

    const updateContextData = () => {
      // Coletar informações de bateria (simulado)
      const updateContext = () => {
        intelligentThemeService.updateContextData({
          appUsageTime: Date.now() % 3600, // Simula tempo de uso
          batteryLevel: Math.floor(Math.random() * 100) // Simula nível de bateria
        });
      };

      // Atualizar contexto periodicamente
      usageTimer = setInterval(updateContext, 30000); // A cada 30 segundos
      updateContext(); // Primeira atualização
    };

    // Configurar listeners
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    updateContextData();

    return () => {
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
      if (usageTimer) {
        clearInterval(usageTimer);
      }
    };
  }, [isIntelligentMode]);

  // Lida com mudanças de tema do serviço
  const handleThemeChange = useCallback((newTheme, source) => {
    setTheme(newTheme);
    setThemeSource(source);
    
    // Atualizar estatísticas
    setStats(intelligentThemeService.getUsageStats());
  }, []);

  // Alterna tema manualmente
  const toggleTheme = useCallback(async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      
      // Aplicar tema manualmente
      await intelligentThemeService.applyTheme(newTheme, 'manual');
      
      // Se estiver em modo inteligente, registrar preferência
      if (isIntelligentMode) {
        console.log(`🎨 Tema alterado manualmente para: ${newTheme}`);
      }
    } catch (error) {
      console.error('❌ Erro ao alternar tema:', error);
    }
  }, [theme, isIntelligentMode]);

  // Define tema específico
  const setThemeManually = useCallback(async (newTheme) => {
    try {
      await intelligentThemeService.applyTheme(newTheme, 'manual');
    } catch (error) {
      console.error('❌ Erro ao definir tema:', error);
    }
  }, []);

  // Alterna modo inteligente/manual
  const toggleIntelligentMode = useCallback(async () => {
    try {
      const newMode = !isIntelligentMode;
      
      // Salvar preferência
      await AsyncStorage.setItem('intelligentThemeMode', JSON.stringify(newMode));
      setIsIntelligentMode(newMode);

      // Se ativou modo inteligente, reanalisar tema
      if (newMode) {
        await intelligentThemeService.reanalyzeTheme();
        setThemeSource('intelligent');
      } else {
        setThemeSource('manual');
      }

      console.log(`🎨 Modo ${newMode ? 'Inteligente' : 'Manual'} ativado`);
    } catch (error) {
      console.error('❌ Erro ao alternar modo:', error);
    }
  }, [isIntelligentMode]);

  // Força reanálise do tema
  const forceReanalysis = useCallback(async () => {
    if (isIntelligentMode) {
      try {
        setIsLoading(true);
        const suggestedTheme = await intelligentThemeService.reanalyzeTheme();
        setThemeSource('intelligent');
        console.log(`🎨 Tema reanalisado: ${suggestedTheme}`);
      } catch (error) {
        console.error('❌ Erro na reanálise:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isIntelligentMode]);

  // Obtém cores baseadas no tema
  const getThemeColors = useCallback(() => {
    if (theme === 'dark') {
      return {
        background: '#0F172A',
        surface: '#1E293B',
        surfaceLight: '#334155',
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        border: '#334155',
        primary: '#3B82F6',
        primaryLight: '#1E40AF',
        accent: '#8B5CF6',
        accentLight: '#6D28D9',
        success: '#10B981',
        successLight: '#059669',
        warning: '#F59E0B',
        warningLight: '#D97706',
        danger: '#EF4444',
        dangerLight: '#DC2626',
        white: '#FFFFFF',
        black: '#000000'
      };
    } else {
      return {
        background: '#FFFFFF',
        surface: '#F8FAFC',
        surfaceLight: '#F1F5F9',
        text: '#0F172A',
        textMuted: '#64748B',
        border: '#E2E8F0',
        primary: '#3B82F6',
        primaryLight: '#DBEAFE',
        accent: '#8B5CF6',
        accentLight: '#EDE9FE',
        success: '#10B981',
        successLight: '#D1FAE5',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        white: '#FFFFFF',
        black: '#000000'
      };
    }
  }, [theme]);

  // Obtém informações do tema
  const getThemeInfo = useCallback(() => ({
    currentTheme: theme,
    isIntelligentMode,
    themeSource,
    isLoading,
    stats,
    colors: getThemeColors()
  }), [theme, isIntelligentMode, themeSource, isLoading, stats, getThemeColors]);

  return {
    // Estado atual
    theme,
    isIntelligentMode,
    themeSource,
    isLoading,
    stats,
    
    // Cores
    colors: getThemeColors(),
    
    // Ações
    toggleTheme,
    setThemeManually,
    toggleIntelligentMode,
    forceReanalysis,
    
    // Informações
    getThemeInfo,
    getThemeColors
  };
};

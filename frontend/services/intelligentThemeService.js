import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

/**
 * Serviço Inteligente de Temas usando GROQ
 * Detecta contexto, aprende com usuário e sugere temas automaticamente
 */

class IntelligentThemeService {
  constructor() {
    this.currentTheme = 'light';
    this.userPreferences = {
      preferredHours: {},
      locationPreferences: {},
      usagePatterns: {},
      manualChanges: []
    };
    this.contextData = {
      currentHour: new Date().getHours(),
      currentLocation: null,
      batteryLevel: null,
      appUsageTime: 0
    };
    this.isInitialized = false;
  }

  /**
   * Inicializa o serviço inteligente
   */
  async initialize() {
    try {
      // Carregar preferências salvas
      await this.loadUserPreferences();
      
      // Configurar listener para mudanças no sistema
      Appearance.addChangeListener(this.handleSystemThemeChange.bind(this));
      
      // Detectar tema inicial
      await this.detectOptimalTheme();
      
      this.isInitialized = true;
      console.log('🎨 IntelligentThemeService inicializado');
      
      return this.currentTheme;
    } catch (error) {
      console.error('❌ Erro ao inicializar IntelligentThemeService:', error);
      return 'light';
    }
  }

  /**
   * Carrega preferências do usuário do AsyncStorage
   */
  async loadUserPreferences() {
    try {
      const saved = await AsyncStorage.getItem('intelligentThemePreferences');
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      console.log('⚠️ Erro ao carregar preferências:', error);
    }
  }

  /**
   * Salva preferências do usuário
   */
  async saveUserPreferences() {
    try {
      await AsyncStorage.setItem(
        'intelligentThemePreferences', 
        JSON.stringify(this.userPreferences)
      );
    } catch (error) {
      console.log('⚠️ Erro ao salvar preferências:', error);
    }
  }

  /**
   * Detecta tema ótimo usando IA + preferências do sistema
   */
  async detectOptimalTheme() {
    try {
      // Coletar dados de contexto
      const context = await this.collectContextData();
      
      // Priorizar tema do sistema
      if (context.systemTheme) {
        console.log(`📱 Tema do sistema detectado: ${context.systemTheme}`);
        
        // Se o usuário mudou manualmente antes, respeitar preferência
        const lastManualChange = this.userPreferences.manualChanges[this.userPreferences.manualChanges.length - 1];
        const timeSinceLastChange = lastManualChange ? 
          Date.now() - new Date(lastManualChange.timestamp).getTime() : 
          Infinity;
        
        // Se mudou manualmente há menos de 1 hora, manter preferência
        if (timeSinceLastChange < 3600000) { // 1 hora
          console.log(`👤 Mantendo preferência manual: ${lastManualChange.theme}`);
          return lastManualChange.theme;
        }
        
        // Caso contrário, seguir o sistema
        await this.applyTheme(context.systemTheme, 'system_sync');
        return context.systemTheme;
      }
      
      // Fallback: usar análise inteligente
      const themeSuggestion = await this.analyzeContextWithAI(context);
      
      // Aplicar tema sugerido
      if (themeSuggestion && themeSuggestion !== this.currentTheme) {
        await this.applyTheme(themeSuggestion, 'ai_suggestion');
      }
      
      return themeSuggestion;
    } catch (error) {
      console.error('❌ Erro ao detectar tema ótimo:', error);
      return this.getFallbackTheme();
    }
  }

  /**
   * Coleta dados de contexto para análise
   */
  async collectContextData() {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      hour,
      dayOfWeek: now.getDay(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      batteryLevel: this.contextData.batteryLevel,
      appUsageTime: this.contextData.appUsageTime,
      recentManualChanges: this.userPreferences.manualChanges.slice(-10),
      preferredHours: this.userPreferences.preferredHours,
      systemTheme: Appearance.getColorScheme(), // 🎯 DETECTAR TEMA DO SISTEMA!
      location: this.contextData.currentLocation
    };
  }

  /**
   * Usa GROQ para analisar contexto e sugerir tema
   */
  async analyzeContextWithAI(context) {
    try {
      const prompt = `
        Como um especialista em UX e design de interfaces, analise o contexto do usuário e sugira o tema ideal (light/dark).

        CONTEXTO ATUAL:
        - Hora: ${context.hour}h
        - Dia da semana: ${context.dayOfWeek} (0=Domingo, 6=Sábado)
        - Fim de semana: ${context.isWeekend ? 'Sim' : 'Não'}
        - Nível de bateria: ${context.batteryLevel}%
        - Tempo de uso do app: ${context.appUsageTime} minutos
        - Tema do sistema: ${context.systemTheme || 'Não detectado'}
        - Mudanças manuais recentes: ${context.recentManualChanges.length}

        HISTÓRICO DE PREFERÊNCIAS:
        - Horários preferidos: ${JSON.stringify(context.preferredHours)}

        REGRAS PARA SUGESTÃO:
        1. Dark mode é melhor para:
           - Horários noturnos (19h-7h)
           - Economia de bateria
           - Uso prolongado do app
           - Ambientes com pouca luz
        
        2. Light mode é melhor para:
           - Horários diurnos (8h-18h)
           - Ambientes bem iluminados
           - Uso rápido do app
           - Conteúdo com muitas imagens

        3. Considere padrões do usuário:
           - Se o usuário muda manualmente, aprenda o padrão
           - Respeite preferências em horários específicos
           - Adapte-se ao comportamento

        RESPOSTA (apenas JSON):
        {
          "theme": "light|dark",
          "confidence": 0.0-1.0,
          "reasoning": "breve explicação",
          "suggestion_type": "automatic|user_pattern|system_sync"
        }
      `;

      // Simulação de resposta GROQ (substituir com API real)
      const aiResponse = await this.simulateGROQResponse(context);
      
      return aiResponse.theme;
    } catch (error) {
      console.error('❌ Erro na análise GROQ:', error);
      return this.getFallbackTheme();
    }
  }

  /**
   * Simulação de resposta GROQ (substituir com API real)
   */
  async simulateGROQResponse(context) {
    const hour = context.hour;
    let theme = 'light';
    let confidence = 0.5;
    let reasoning = '';
    let suggestionType = 'automatic';

    // Regras baseadas em hora
    if (hour >= 19 || hour <= 7) {
      theme = 'dark';
      confidence = 0.8;
      reasoning = 'Horário noturno - melhor para os olhos e bateria';
      suggestionType = 'automatic';
    } else if (hour >= 8 && hour <= 18) {
      theme = 'light';
      confidence = 0.7;
      reasoning = 'Horário diurno - melhor para ambientes iluminados';
      suggestionType = 'automatic';
    }

    // Considerar preferências do usuário
    const hourKey = `${hour}:00`;
    if (context.preferredHours[hourKey]) {
      theme = context.preferredHours[hourKey];
      confidence = 0.9;
      reasoning = `Padrão detectado - usuário prefere ${theme} neste horário`;
      suggestionType = 'user_pattern';
    }

    // Considerar bateria
    if (context.batteryLevel < 20) {
      theme = 'dark';
      confidence = Math.max(confidence, 0.8);
      reasoning = 'Bateria baixa - dark mode economiza energia';
      suggestionType = 'automatic';
    }

    return {
      theme,
      confidence,
      reasoning,
      suggestion_type: suggestionType
    };
  }

  /**
   * Aplica tema sugerido
   */
  async applyTheme(theme, source = 'manual') {
    try {
      const previousTheme = this.currentTheme;
      this.currentTheme = theme;

      // Registrar mudança manual
      if (source === 'manual') {
        this.registerManualChange(theme);
      }

      // Salvar preferência
      await AsyncStorage.setItem('selectedTheme', theme);

      // Notificar mudança (será implementado no hook)
      this.notifyThemeChange(theme, source);

      console.log(`🎨 Tema alterado: ${previousTheme} → ${theme} (${source})`);
      
      return theme;
    } catch (error) {
      console.error('❌ Erro ao aplicar tema:', error);
      return this.currentTheme;
    }
  }

  /**
   * Registra mudança manual do usuário
   */
  registerManualChange(theme) {
    const now = new Date();
    const hourKey = `${now.getHours()}:00`;
    
    // Adicionar ao histórico
    this.userPreferences.manualChanges.push({
      theme,
      timestamp: now.toISOString(),
      hour: now.getHours()
    });

    // Manter apenas últimas 50 mudanças
    if (this.userPreferences.manualChanges.length > 50) {
      this.userPreferences.manualChanges = this.userPreferences.manualChanges.slice(-50);
    }

    // Atualizar preferências por hora
    if (!this.userPreferences.preferredHours[hourKey]) {
      this.userPreferences.preferredHours[hourKey] = {};
    }
    
    if (!this.userPreferences.preferredHours[hourKey][theme]) {
      this.userPreferences.preferredHours[hourKey][theme] = 0;
    }
    this.userPreferences.preferredHours[hourKey][theme]++;

    // Salvar preferências
    this.saveUserPreferences();
  }

  /**
   * Lida com mudanças no tema do sistema
   */
  handleSystemThemeChange({ colorScheme }) {
    if (colorScheme && this.isInitialized) {
      console.log(`📱 Tema do sistema mudou para: ${colorScheme}`);
      
      // Se não houver mudança manual recente, seguir o sistema
      const lastManualChange = this.userPreferences.manualChanges[this.userPreferences.manualChanges.length - 1];
      const timeSinceLastChange = lastManualChange ? 
        Date.now() - new Date(lastManualChange.timestamp).getTime() : 
        Infinity;
      
      // Se não mudou manualmente há menos de 1 hora, seguir sistema
      if (timeSinceLastChange >= 3600000) { // 1 hora
        this.applyTheme(colorScheme, 'system_sync');
      } else {
        console.log(`� Mantendo preferência manual (mudou há ${Math.round(timeSinceLastChange / 60000)}min)`);
      }
    }
  }

  /**
   * Notifica mudança de tema
   */
  notifyThemeChange(theme, source) {
    // Evento para ser capturado pelo hook useColors
    if (this.themeChangeCallback) {
      this.themeChangeCallback(theme, source);
    }
  }

  /**
   * Define callback para mudanças de tema
   */
  setThemeChangeCallback(callback) {
    this.themeChangeCallback = callback;
  }

  /**
   * Obtém tema fallback (baseado em hora)
   */
  getFallbackTheme() {
    const hour = new Date().getHours();
    return (hour >= 19 || hour <= 7) ? 'dark' : 'light';
  }

  /**
   * Atualiza dados de contexto
   */
  updateContextData(data) {
    this.contextData = { ...this.contextData, ...data };
  }

  /**
   * Obtém tema atual
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Força reanálise do tema
   */
  async reanalyzeTheme() {
    return await this.detectOptimalTheme();
  }

  /**
   * Obtém estatísticas de uso
   */
  getUsageStats() {
    return {
      currentTheme: this.currentTheme,
      totalManualChanges: this.userPreferences.manualChanges.length,
      preferredHours: this.userPreferences.preferredHours,
      isInitialized: this.isInitialized
    };
  }
}

// Instância singleton
const intelligentThemeService = new IntelligentThemeService();

export default intelligentThemeService;

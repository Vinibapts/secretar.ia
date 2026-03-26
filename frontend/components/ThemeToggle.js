import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIntelligentTheme } from '../hooks/useIntelligentTheme';

/**
 * Componente de controle de tema inteligente
 * Permite alternar entre modo inteligente/manual e temas
 */
export const ThemeToggle = ({ style }) => {
  const { 
    theme, 
    isIntelligentMode, 
    themeSource, 
    isLoading,
    toggleTheme, 
    toggleIntelligentMode,
    forceReanalysis,
    getThemeInfo 
  } = useIntelligentTheme();

  const themeInfo = getThemeInfo();

  const getThemeIcon = () => {
    if (theme === 'dark') {
      return 'moon';
    } else {
      return 'sunny';
    }
  };

  const getThemeIconColor = () => {
    if (theme === 'dark') {
      return '#F59E0B';
    } else {
      return '#F59E0B';
    }
  };

  const getSourceIcon = () => {
    switch (themeSource) {
      case 'intelligent':
        return 'brain';
      case 'system':
        return 'phone-portrait';
      case 'system_sync':
        return 'sync';
      case 'manual':
        return 'hand-left';
      case 'saved':
        return 'save';
      default:
        return 'settings';
    }
  };

  const getSourceText = () => {
    switch (themeSource) {
      case 'intelligent':
        return 'IA';
      case 'system':
        return 'Sistema';
      case 'system_sync':
        return 'Sistema';
      case 'manual':
        return 'Manual';
      case 'saved':
        return 'Salvo';
      default:
        return 'Auto';
    }
  };

  const getSourceColor = () => {
    if (themeSource === 'intelligent') {
      return '#8B5CF6';
    } else if (themeSource === 'system' || themeSource === 'system_sync') {
      return '#3B82F6';
    } else if (themeSource === 'manual') {
      return '#10B981';
    } else {
      return '#64748B';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={getThemeIcon()} 
            size={20} 
            color={getThemeIconColor()} 
          />
          <Text style={styles.title}>Tema</Text>
        </View>
        
        {/* Indicador de fonte */}
        <View style={styles.sourceIndicator}>
          <Ionicons 
            name={getSourceIcon()} 
            size={14} 
            color={getSourceColor()} 
          />
          <Text style={[styles.sourceText, { color: getSourceColor() }]}>
            {getSourceText()}
          </Text>
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        {/* Toggle Inteligente/Manual */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Modo Inteligente</Text>
            <Text style={styles.toggleDescription}>
              {isIntelligentMode 
                ? 'IA ajusta tema automaticamente' 
                : 'Controle manual do tema'
              }
            </Text>
          </View>
          <Switch
            value={isIntelligentMode}
            onValueChange={toggleIntelligentMode}
            trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
            thumbColor={isIntelligentMode ? '#FFFFFF' : '#64748B'}
            ios_backgroundColor="#E2E8F0"
          />
        </View>

        {/* Toggle Tema (se modo manual) */}
        {!isIntelligentMode && (
          <View style={styles.themeToggleRow}>
            <TouchableOpacity 
              style={styles.themeButton}
              onPress={toggleTheme}
              disabled={isLoading}
            >
              <View style={styles.themeButtonContent}>
                <Ionicons 
                  name={getThemeIcon()} 
                  size={24} 
                  color={getThemeIconColor()} 
                />
                <View style={styles.themeText}>
                  <Text style={styles.themeLabel}>
                    Tema {theme === 'dark' ? 'Escuro' : 'Claro'}
                  </Text>
                  <Text style={styles.themeDescription}>
                    Toque para alternar
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color="#64748B" 
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Botão de Reanálise (se modo inteligente) */}
        {isIntelligentMode && (
          <View style={styles.reanalysisRow}>
            <TouchableOpacity 
              style={styles.reanalysisButton}
              onPress={forceReanalysis}
              disabled={isLoading}
            >
              <View style={styles.reanalysisContent}>
                <Ionicons 
                  name="refresh" 
                  size={16} 
                  color="#8B5CF6" 
                />
                <Text style={styles.reanalysisText}>
                  Reanalisar tema
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Estatísticas (debug) */}
      {__DEV__ && themeInfo?.stats && (
        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Estatísticas (Debug)</Text>
          <Text style={styles.statsText}>
            Mudanças manuais: {themeInfo.stats.totalManualChanges}
          </Text>
          <Text style={styles.statsText}>
            Preferências por hora: {Object.keys(themeInfo.stats.preferredHours).length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2233',
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  controls: {
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2233',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  themeToggleRow: {
    marginTop: 8,
  },
  themeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  themeText: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2233',
  },
  themeDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reanalysisRow: {
    marginTop: 8,
  },
  reanalysisButton: {
    alignSelf: 'flex-start',
  },
  reanalysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  reanalysisText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  stats: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2233',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
});

export default ThemeToggle;

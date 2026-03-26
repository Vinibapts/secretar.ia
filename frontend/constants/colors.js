import { useColorScheme } from 'react-native';

const light = {
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

const dark = {
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

export function useColors() {
  // APP SEMPRE EM MODO CLARO - FIXO
  return light;
}

export { light, dark };
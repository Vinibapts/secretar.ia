import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'pt', // idioma padrão enquanto carrega
  fallbackLng: 'pt',
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
  },
  interpolation: { escapeValue: false },
});

// Carrega o idioma salvo pelo usuário
AsyncStorage.getItem('appLanguage').then((lang) => {
  if (lang) i18n.changeLanguage(lang);
});

export default i18n;
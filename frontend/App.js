import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Modal, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useColors } from './constants/colors';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginScreen from './app/login';
import DashboardScreen from './app/dashboard';
import AgendaScreen from './app/agenda';
import FinancesScreen from './app/finances';
import RankingScreen from './app/ranking';
import { transcribeAudio } from './services/api';

const Tab = createBottomTabNavigator();

function VoiceModal({ visible, onClose }) {
  const Colors = useColors();
  const [status, setStatus] = useState('idle');
  const [response, setResponse] = useState('');
  const [voiceId, setVoiceId] = useState(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then(voices => {
      const ptVoices = voices.filter(v => v.language === 'pt-BR' || v.language === 'pt_BR');
      const prioridade = [
        'com.apple.voice.enhanced.pt-BR.Luciana',
        'com.apple.ttsbundle.Luciana-premium',
        'com.apple.ttsbundle.siri_female_pt-BR_compact',
        'com.apple.ttsbundle.Luciana-compact',
      ];
      let voiceEscolhida = null;
      for (const id of prioridade) {
        const encontrada = ptVoices.find(v => v.identifier === id);
        if (encontrada) { voiceEscolhida = id; break; }
      }
      if (!voiceEscolhida && ptVoices.length > 0) voiceEscolhida = ptVoices[0].identifier;
      setVoiceId(voiceEscolhida);
    });
  }, []);

  useEffect(() => {
    if (visible) { setStatus('idle'); setResponse(''); iniciarGravacao(); }
    else { pararTudo(); }
  }, [visible]);

  useEffect(() => {
    if (status === 'recording') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      if (pulseLoop.current) pulseLoop.current.stop();
      pulseAnim.setValue(1);
    }
  }, [status]);

  const pararTudo = async () => {
    try { Speech.stop(); } catch {}
    setStatus('idle');
    setResponse('');
  };

  const iniciarGravacao = async () => {
    try {
      await AudioModule.requestRecordingPermissionsAsync();
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setStatus('recording');
    } catch (err) {
      console.log('Erro ao gravar:', err);
      onClose();
    }
  };

  const pararGravacao = async () => {
    try {
      setStatus('processing');
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) { onClose(); return; }
      const res = await transcribeAudio(uri);
      const { resposta } = res.data;
      setResponse(resposta);
      setStatus('speaking');
      const textoLimpo = resposta
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
        .replace(/[✅⚠️❌🎤]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      const speechOptions = {
        language: 'pt-BR', pitch: 1.05, rate: 0.92,
        onDone: () => setTimeout(() => onClose(), 800),
        onStopped: () => onClose(),
        onError: () => onClose(),
      };
      if (voiceId) speechOptions.voice = voiceId;
      Speech.speak(textoLimpo, speechOptions);
    } catch (err) {
      console.log('Erro ao processar:', err);
      setStatus('idle');
      setTimeout(() => onClose(), 1500);
    }
  };

  const handlePress = async () => {
    if (status === 'recording') await pararGravacao();
    else if (status === 'speaking') { Speech.stop(); onClose(); }
  };

  const getIcon = () => {
    if (status === 'recording') return 'stop';
    if (status === 'processing') return 'hourglass';
    if (status === 'speaking') return 'stop';
    return 'mic';
  };

  const getColor = () => {
    if (status === 'recording') return '#EF4444';
    if (status === 'processing') return '#F59E0B';
    if (status === 'speaking') return '#10B981';
    return Colors.primary;
  };

  const getLabel = () => {
    if (status === 'recording') return 'Ouvindo... Toque para parar';
    if (status === 'processing') return 'Processando...';
    if (status === 'speaking') return 'Toque para parar';
    return '';
  };

  const color = getColor();

  const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 32, borderTopRightRadius: 32,
      paddingBottom: 48, paddingTop: 16, paddingHorizontal: 24,
      alignItems: 'center', gap: 16,
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 8 },
    aiIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    aiTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    pulseRing: { width: 190, height: 190, borderRadius: 95, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
    outerRing: { width: 168, height: 168, borderRadius: 84, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    middleRing: { width: 142, height: 142, borderRadius: 71, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    micButton: { width: 116, height: 116, borderRadius: 58, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 18, overflow: 'hidden' },
    micButtonShine: { position: 'absolute', top: 8, left: 12, width: 92, height: 48, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.25)' },
    micButtonDepth: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, borderBottomLeftRadius: 58, borderBottomRightRadius: 58, backgroundColor: 'rgba(0,0,0,0.12)' },
    statusLabel: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
    responseBox: { backgroundColor: Colors.surfaceLight, borderRadius: 16, padding: 16, width: '100%' },
    responseText: { fontSize: 15, color: Colors.text, lineHeight: 22, textAlign: 'center' },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 14, backgroundColor: Colors.surfaceLight },
    cancelText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.aiIcon}>
            <Ionicons name="sparkles" size={22} color={Colors.primary} />
          </View>
          <Text style={modalStyles.aiTitle}>
            Secretar<Text style={{ color: Colors.primary }}>.IA</Text>
          </Text>
          <Animated.View style={[modalStyles.pulseRing, { backgroundColor: color + '12', transform: [{ scale: pulseAnim }] }]}>
            <View style={[modalStyles.outerRing, { borderColor: color + '35' }]}>
              <View style={[modalStyles.middleRing, { borderColor: color + '60' }]}>
                <TouchableOpacity
                  style={[modalStyles.micButton, { backgroundColor: color, shadowColor: color }]}
                  onPress={handlePress}
                  disabled={status === 'processing'}
                  activeOpacity={0.88}
                >
                  <View style={modalStyles.micButtonShine} />
                  <View style={modalStyles.micButtonDepth} />
                  {status === 'processing' ? (
                    <ActivityIndicator size="large" color="white" />
                  ) : (
                    <Ionicons name={getIcon()} size={42} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
          <Text style={modalStyles.statusLabel}>{getLabel()}</Text>
          {response ? (
            <View style={modalStyles.responseBox}>
              <Text style={modalStyles.responseText}>{response}</Text>
            </View>
          ) : null}
          {(status === 'recording' || status === 'idle') && (
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function MainTabs({ onVoicePress, onLogout }) {
  const Colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Painel: focused ? 'home' : 'home-outline',
            Agenda: focused ? 'calendar' : 'calendar-outline',
            Finanças: focused ? 'wallet' : 'wallet-outline',
            Ranking: focused ? 'trophy' : 'trophy-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Painel">
        {(props) => <DashboardScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen
        name="Voz"
        component={DashboardScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View style={{
              width: 62, height: 62, borderRadius: 31,
              backgroundColor: Colors.primary,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
              overflow: 'hidden',
            }}>
              <View style={{
                position: 'absolute', top: 4, left: 6,
                width: 50, height: 24, borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }} />
              <Ionicons name="mic" size={28} color="white" />
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} onPress={onVoicePress} />
          ),
        }}
      />
      <Tab.Screen name="Finanças" component={FinancesScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
    </Tab.Navigator>
  );
}

// ✅ App interno que usa os hooks (precisa estar dentro do ThemeProvider)
function AppContent() {
  const { isDark } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voiceVisible, setVoiceVisible] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const keepConnected = await AsyncStorage.getItem('keepConnected');
      if (token && keepConnected === 'true') {
        setIsLoggedIn(true);
      } else {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('keepConnected');
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <>
      {/* ✅ StatusBar muda com o tema */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {isLoggedIn ? (
        <NavigationContainer>
          <MainTabs
            onVoicePress={() => setVoiceVisible(true)}
            onLogout={() => setIsLoggedIn(false)}
          />
          <VoiceModal
            visible={voiceVisible}
            onClose={() => setVoiceVisible(false)}
          />
        </NavigationContainer>
      ) : (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

// ✅ ThemeProvider envolve TUDO — todas as telas recebem o tema global
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Animated, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Colors } from '../constants/colors';
import { transcribeAudio } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function VoiceScreen() {
  const { t } = useTranslation();

  const [status, setStatus] = useState('idle');
  const [lastText, setLastText] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    pedirPermissao();
    return () => Speech.stop();
  }, []);

  useEffect(() => {
    if (status === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const pedirPermissao = async () => {
    try {
      await AudioModule.requestRecordingPermissionsAsync();
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    } catch (err) {
      console.log('Erro permissão:', err);
    }
  };

  const handlePress = async () => {
    if (status === 'recording') await pararGravacao();
    else if (status === 'idle') await iniciarGravacao();
    else if (status === 'speaking') { Speech.stop(); setStatus('idle'); }
  };

  const iniciarGravacao = async () => {
    try {
      await Speech.stop();
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setStatus('recording');
      setLastText('');
      setLastResponse('');
    } catch (err) {
      console.log('Erro ao gravar:', err);
      setStatus('idle');
    }
  };

  const pararGravacao = async () => {
    try {
      setStatus('processing');
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) { setStatus('idle'); return; }

      const res = await transcribeAudio(uri);
      const { texto_transcrito, resposta } = res.data;

      setLastText(texto_transcrito);
      setLastResponse(resposta);
      setStatus('speaking');

      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });

      Speech.speak(resposta, {
        language: 'pt-BR', pitch: 1.0, rate: 1.1,
        onDone: () => setStatus('idle'),
        onStopped: () => setStatus('idle'),
        onError: () => setStatus('idle'),
      });
    } catch (err) {
      console.log('Erro ao processar:', err);
      setStatus('idle');
    }
  };

  const getButtonColor = () => {
    if (status === 'recording')  return Colors.danger;
    if (status === 'processing') return Colors.warning;
    if (status === 'speaking')   return Colors.success;
    return Colors.primary;
  };

  const getButtonIcon = () => {
    if (status === 'recording')  return 'stop';
    if (status === 'processing') return 'hourglass';
    if (status === 'speaking')   return 'volume-high';
    return 'mic';
  };

  const getStatusText = () => {
    if (status === 'recording')  return t('voice_ouvindo');
    if (status === 'processing') return t('voice_processando');
    if (status === 'speaking')   return t('voice_respondendo');
    return t('voice_toque_falar');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Secretar<Text style={styles.titleAccent}>.IA</Text>
        </Text>
        <Text style={styles.subtitle}>{t('assistente_voz')}</Text>
      </View>

      <View style={styles.textArea}>
        {lastText ? (
          <View style={styles.transcriptBox}>
            <View style={styles.transcriptHeader}>
              <Ionicons name="person-circle" size={18} color={Colors.primary} />
              <Text style={styles.transcriptLabel}>{t('voce_disse')}</Text>
            </View>
            <Text style={styles.transcriptText}>{lastText}</Text>
          </View>
        ) : null}

        {lastResponse ? (
          <View style={styles.responseBox}>
            <View style={styles.transcriptHeader}>
              <Ionicons name="sparkles" size={18} color={Colors.success} />
              <Text style={[styles.transcriptLabel, { color: Colors.success }]}>Secretar.IA</Text>
            </View>
            <Text style={styles.responseText}>{lastResponse}</Text>
          </View>
        ) : null}

        {status === 'idle' && !lastText && (
          <View style={styles.emptyState}>
            <Ionicons name="mic-circle-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyText}>{t('fale_secretaria')}</Text>
            <Text style={styles.emptySubtext}>{t('voice_dica')}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonArea}>
        <Text style={styles.statusText}>{getStatusText()}</Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: getButtonColor() }]}
            onPress={handlePress}
            disabled={status === 'processing'}
            activeOpacity={0.85}
          >
            {status === 'processing' ? (
              <ActivityIndicator size="large" color={Colors.white} />
            ) : (
              <Ionicons name={getButtonIcon()} size={44} color={Colors.white} />
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.tipsRow}>
          <View style={styles.tip}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.tipText}>{t('agenda')}</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="wallet-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.tipText}>{t('financas')}</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="heart-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.tipText}>{t('habitos')}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  titleAccent: { color: Colors.primary },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  textArea: { flex: 1, paddingHorizontal: 24, paddingTop: 16, justifyContent: 'center' },
  emptyState: { alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySubtext: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  transcriptBox: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  responseBox: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    borderLeftWidth: 3, borderLeftColor: Colors.success,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  transcriptLabel: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  transcriptText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  responseText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  buttonArea: { alignItems: 'center', paddingBottom: 40, paddingTop: 16, gap: 16 },
  statusText: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
  mainButton: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },
  tipsRow: { flexDirection: 'row', gap: 24, marginTop: 8 },
  tip: { alignItems: 'center', gap: 4 },
  tipText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
});
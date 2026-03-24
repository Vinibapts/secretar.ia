import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { Colors } from '../constants/colors';
import { sendMessage, transcribeAudio } from '../services/api';

const getInitialMessage = (nome) => [{
  id: '1',
  role: 'ai',
  content: `Olá${nome ? ', ' + nome.split(' ')[0] : ''}! 👋 Sou sua secretária pessoal com IA. Posso ajudar com sua agenda, finanças, hábitos e muito mais. O que precisa hoje?`,
  time: '08:00',
}];

export default function ChatScreen() {
  const [messages, setMessages] = useState(getInitialMessage(''));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const flatListRef = useRef(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    buscarNome();
    pedirPermissaoMicrofone();
  }, []);

  const buscarNome = async () => {
    const nome = await AsyncStorage.getItem('nomeUsuario');
    if (nome) setMessages(getInitialMessage(nome));
  };

  const pedirPermissaoMicrofone = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.log('Permissão de microfone negada');
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    } catch (err) {
      console.log('Erro ao configurar áudio:', err);
    }
  };

  const getTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      time: getTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessage({ mensagem: userMsg.content });
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: res.data.resposta,
        time: getTime(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Desculpe, ocorreu um erro. Tente novamente!',
        time: getTime(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleMicPress = async () => {
    if (isRecording) {
      await pararGravacao();
    } else {
      await iniciarGravacao();
    }
  };

  const iniciarGravacao = async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.log('Erro ao gravar:', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  const pararGravacao = async () => {
    try {
      setIsRecording(false);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) {
        Alert.alert('Erro', 'Nenhum áudio gravado.');
        return;
      }

      // Mostra loading de transcrição
      setIsTranscribing(true);
      setLoading(true);

      // Envia para o backend transcrever e processar
      const res = await transcribeAudio(uri);
      const { texto_transcrito, resposta } = res.data;

      // Adiciona a mensagem do usuário (texto transcrito)
      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: `🎤 ${texto_transcrito}`,
        time: getTime(),
      };

      // Adiciona a resposta da IA
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: resposta,
        time: getTime(),
      };

      setMessages(prev => [...prev, userMsg, aiMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    } catch (err) {
      console.log('Erro ao transcrever:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: '❌ Erro ao processar o áudio. Tente novamente!',
        time: getTime(),
      }]);
    } finally {
      setIsTranscribing(false);
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={16} color={Colors.primary} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
          <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
            {item.time}
          </Text>
        </View>
        {isUser && (
          <View style={styles.avatarUser}>
            <Ionicons name="person" size={16} color={Colors.primary} />
          </View>
        )}
      </View>
    );
  };

  const hasInput = input.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              Secretar<Text style={styles.headerAccent}>.IA</Text>
            </Text>
            <View style={styles.headerStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.headerStatusText}>Online — pronta para ajudar</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Loading / Transcribing indicator */}
        {loading && (
          <View style={styles.loadingRow}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={16} color={Colors.primary} />
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>
                {isTranscribing ? 'Transcrevendo áudio...' : 'Processando...'}
              </Text>
            </View>
          </View>
        )}

        {/* Gravando indicator */}
        {isRecording && (
          <View style={styles.recordingRow}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Gravando... Toque para parar</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          {hasInput ? (
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              disabled={loading}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.micBtn, isRecording && styles.micBtnRecording]}
              onPress={handleMicPress}
              disabled={loading}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={22}
                color={isRecording ? Colors.white : Colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  headerAvatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  headerAccent: { color: Colors.primary },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success },
  headerStatusText: { fontSize: 12, color: Colors.textMuted },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16 },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarUser: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: {
    maxWidth: '75%', borderRadius: 18, padding: 12,
    backgroundColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {},
  bubbleText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  bubbleTextUser: { color: Colors.white },
  bubbleTime: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'right' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },
  loadingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, marginBottom: 8,
  },
  loadingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 18, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  loadingText: { fontSize: 13, color: Colors.textMuted },
  recordingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.dangerLight,
    marginHorizontal: 16, borderRadius: 12, marginBottom: 8,
  },
  recordingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  recordingText: { fontSize: 13, color: Colors.danger, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 16, backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    color: Colors.text, fontSize: 15, maxHeight: 120,
  },
  sendBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  micBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  micBtnRecording: {
    backgroundColor: Colors.danger,
  },
});
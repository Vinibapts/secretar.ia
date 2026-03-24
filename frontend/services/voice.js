import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

class VoiceService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.isSpeaking = false;
  }

  // Configurar permissões de áudio
  async setupAudio() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de áudio:', error);
      return false;
    }
  }

  // Iniciar gravação
  async startRecording() {
    try {
      const hasPermission = await this.setupAudio();
      if (!hasPermission) {
        throw new Error('Permissão de áudio negada');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
      
      console.log('Gravação iniciada');
      return recording;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      throw error;
    }
  }

  // Parar gravação e retornar URI
  async stopRecording() {
    if (!this.recording || !this.isRecording) {
      throw new Error('Nenhuma gravação em andamento');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.recording = null;
      this.isRecording = false;
      
      console.log('Gravação parada:', uri);
      return uri;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      throw error;
    }
  }

  // Cancelar gravação
  async cancelRecording() {
    if (this.recording && this.isRecording) {
      try {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
        this.isRecording = false;
        console.log('Gravação cancelada');
      } catch (error) {
        console.error('Erro ao cancelar gravação:', error);
      }
    }
  }

  // Falar texto (Text-to-Speech)
  async speak(text, options = {}) {
    if (this.isSpeaking) {
      await this.stopSpeaking();
    }

    try {
      this.isSpeaking = true;
      
      const defaultOptions = {
        language: 'pt-BR',
        voice: 'pt-BR-Standard-A',
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
      };

      const speakOptions = { ...defaultOptions, ...options };
      
      await Speech.speak(text, speakOptions);
      
      console.log('Falando:', text);
    } catch (error) {
      console.error('Erro ao falar:', error);
      this.isSpeaking = false;
      throw error;
    }
  }

  // Parar de falar
  async stopSpeaking() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
      console.log('Fala parada');
    } catch (error) {
      console.error('Erro ao parar fala:', error);
    }
  }

  // Verificar se está gravando
  isCurrentlyRecording() {
    return this.isRecording;
  }

  // Verificar se está falando
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  // Obter status da gravação
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      canRecord: !this.isRecording,
      hasRecording: !!this.recording,
    };
  }
}

// Exportar instância única
export const voiceService = new VoiceService();
export default voiceService;

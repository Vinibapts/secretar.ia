import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '../constants/colors';
import { login, register } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../i18n';

const formatarNome = (email) => {
  const nome = email.split('@')[0];
  const partes = nome.replace(/([A-Z])/g, ' $1').replace(/([0-9])/g, ' $1').trim().split(/\s+/);
  return partes.map(parte => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase()).join(' ');
};

export default function LoginScreen({ onLogin }) {
  const Colors = useColors();
  const { t } = useTranslation();

  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepConnected, setKeepConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { carregarCredenciais(); }, []);

  const carregarCredenciais = async () => {
    try {
      const emailSalvo = await AsyncStorage.getItem('emailSalvo');
      const senhaSalva = await AsyncStorage.getItem('senhaSalva');
      const keep = await AsyncStorage.getItem('keepConnected');
      if (emailSalvo && keep === 'true') {
        setEmail(emailSalvo);
        setSenha(senhaSalva || '');
        setKeepConnected(true);
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!email || !senha) {
      Alert.alert(t('atencao'), t('preencha_campos'));
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login({ email, senha });
        await AsyncStorage.setItem('token', res.data.access_token);
        await AsyncStorage.setItem('nomeUsuario', formatarNome(email));
        await AsyncStorage.setItem('emailUsuario', email);
        if (keepConnected) {
          await AsyncStorage.setItem('keepConnected', 'true');
          await AsyncStorage.setItem('emailSalvo', email);
          await AsyncStorage.setItem('senhaSalva', senha);
        } else {
          await AsyncStorage.removeItem('keepConnected');
          await AsyncStorage.removeItem('emailSalvo');
          await AsyncStorage.removeItem('senhaSalva');
        }
        onLogin();
      } else {
        if (!nome) {
          Alert.alert(t('atencao'), t('preencha_nome'));
          return;
        }
        await register({ nome, email, senha });
        Alert.alert(t('sucesso'), t('conta_criada'));
        setIsLogin(true);
      }
    } catch (err) {
      Alert.alert(t('erro'), err.response?.data?.detail || t('algo_deu_errado'));
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoIcon: {
      width: 72, height: 72, borderRadius: 22,
      backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
      marginBottom: 16, shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15,
      shadowRadius: 20, elevation: 8,
    },
    logoText: { fontSize: 32, fontWeight: 'bold', color: Colors.text, letterSpacing: -0.5 },
    logoAccent: { color: Colors.primary },
    logoSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },
    card: {
      backgroundColor: Colors.surface, borderRadius: 24, padding: 24,
      shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
    },
    cardTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 24, textAlign: 'center' },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, color: Colors.text, fontWeight: '500', marginBottom: 6 },
    inputWrapper: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: Colors.surfaceLight, borderRadius: 14,
      paddingHorizontal: 14, height: 50,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: Colors.text, fontSize: 15 },
    keepConnected: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    checkbox: {
      width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
      borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
      backgroundColor: Colors.surface,
    },
    checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    keepConnectedText: { fontSize: 13, color: Colors.textMuted },
    button: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: Colors.primary, borderRadius: 14, height: 52, gap: 8,
      shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    buttonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: Colors.textMuted, fontSize: 14 },
    footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
    poweredBy: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginTop: 24, opacity: 0.6 },
    poweredByAccent: { color: Colors.primary, fontWeight: '600' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>

        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="sparkles" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>
            Secretar<Text style={styles.logoAccent}>.IA</Text>
          </Text>
          <Text style={styles.logoSubtitle}>{t('slogan')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isLogin ? t('entrar_conta') : t('criar_conta')}
          </Text>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('nome')}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('placeholder_nome')}
                  placeholderTextColor={Colors.textMuted}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('email')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('senha')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.keepConnected} onPress={() => setKeepConnected(!keepConnected)}>
              <View style={[styles.checkbox, keepConnected && styles.checkboxActive]}>
                {keepConnected && <Ionicons name="checkmark" size={12} color={Colors.white} />}
              </View>
              <Text style={styles.keepConnectedText}>{t('manter_conectado')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.buttonText}>{isLogin ? t('entrar') : t('criar_conta')}</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? t('nao_tem_conta') : t('ja_tem_conta')}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.footerLink}>{isLogin ? t('criar_conta') : t('entrar')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.poweredBy}>
          Powered by <Text style={styles.poweredByAccent}>{t('inteligencia_artificial')}</Text>
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
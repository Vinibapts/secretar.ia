import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Dimensions, Alert, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { changePassword } from '../services/api';
import '../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

const IDIOMAS = [
  { label: 'Português', flag: '🇧🇷', code: 'pt' },
  { label: 'Inglês',    flag: '🇬🇧', code: 'en' },
  { label: 'Espanhol',  flag: '🇪🇸', code: 'es' },
];

function SidebarContent({ visible, onClose, onLogout, onApelidoChange }) {
  const Colors = useColors();
  const { isDark, changeTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [perfilExpanded,       setPerfilExpanded]       = useState(true);
  const [configExpanded,       setConfigExpanded]       = useState(false);
  const [notificacoesExpanded, setNotificacoesExpanded] = useState(false);
  const [idiomaExpanded,       setIdiomaExpanded]       = useState(true);

  const [nomeUsuario,  setNomeUsuario]  = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');

  // Modal apelido
  const [apelidoModalVisible, setApelidoModalVisible] = useState(false);
  const [apelidoInput, setApelidoInput] = useState('');

  // Modal senha
  const [senhaModalVisible, setSenhaModalVisible] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('apelidoUsuario').then(apelido => {
      if (apelido) {
        setNomeUsuario(apelido);
      } else {
        AsyncStorage.getItem('nomeUsuario').then(nome => {
          if (nome) setNomeUsuario(nome);
        });
      }
    });
    AsyncStorage.getItem('emailUsuario').then(email => {
      if (email) setEmailUsuario(email);
    });
  }, [visible]);

  const handleLogout = async () => {
    onClose();
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('keepConnected');
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const handleChangeLanguage = async (code) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('appLanguage', code);
  };

  const toggleSection = (section) => {
    if (section === 'perfil')       setPerfilExpanded(v => !v);
    if (section === 'config')       setConfigExpanded(v => !v);
    if (section === 'notificacoes') setNotificacoesExpanded(v => !v);
    if (section === 'idioma')       setIdiomaExpanded(v => !v);
  };

  const toggleTheme = () => {
    changeTheme(isDark ? 'light' : 'dark');
  };

  // Apelido
  const abrirAlterarApelido = async () => {
    const atual = await AsyncStorage.getItem('apelidoUsuario');
    setApelidoInput(atual || '');
    setApelidoModalVisible(true);
  };

  const salvarApelido = async () => {
    const apelido = apelidoInput.trim();
    if (!apelido) return;
    await AsyncStorage.setItem('apelidoUsuario', apelido);
    await AsyncStorage.setItem('nomeUsuario', apelido);
    setNomeUsuario(apelido);
    setApelidoModalVisible(false);
    if (onApelidoChange) onApelidoChange(apelido);
    Alert.alert('✅', 'Apelido atualizado com sucesso!');
  };

  // Senha
  const abrirAlterarSenha = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setShowSenhaAtual(false);
    setShowNovaSenha(false);
    setShowConfirmar(false);
    setSenhaModalVisible(true);
  };

  const salvarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Atenção', 'A nova senha e a confirmação não coincidem!');
      return;
    }
    setSalvandoSenha(true);
    try {
      await changePassword({ senha_atual: senhaAtual, nova_senha: novaSenha });
      setSenhaModalVisible(false);
      Alert.alert('✅', 'Senha alterada com sucesso!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Não foi possível alterar a senha!';
      Alert.alert('Erro', msg);
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.sidebar, { backgroundColor: Colors.surface }]}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

            {/* Header do Perfil */}
            <View style={[styles.profileHeader, { borderBottomColor: Colors.border }]}>
              <Image source={require('../assets/fotoperfil.png')} style={styles.profileAvatar} />
              <Text style={[styles.profileName, { color: Colors.text }]}>{nomeUsuario || 'Usuário'}</Text>
              <Text style={[styles.profileEmail, { color: Colors.textMuted }]}>{emailUsuario || ''}</Text>
            </View>

            <View style={styles.menuContainer}>

              {/* Perfil */}
              <View style={styles.menuSection}>
                <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.background }]} onPress={() => toggleSection('perfil')}>
                  <Ionicons name="person-outline" size={20} color={Colors.text} />
                  <Text style={[styles.menuText, { color: Colors.text }]}>{t('perfil')}</Text>
                  <Ionicons name={perfilExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                {perfilExpanded && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity style={[styles.subMenuItem, { backgroundColor: Colors.background }]}>
                      <Text style={[styles.subMenuText, { color: Colors.textMuted }]}>{t('informacoes_pessoais')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.subMenuItem, { backgroundColor: Colors.background }]} onPress={abrirAlterarApelido}>
                      <Text style={[styles.subMenuText, { color: Colors.textMuted }]}>Alterar Apelido</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.subMenuItem, { backgroundColor: Colors.background }]} onPress={abrirAlterarSenha}>
                      <Text style={[styles.subMenuText, { color: Colors.textMuted }]}>{t('alterar_senha')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.subMenuItem, { backgroundColor: Colors.background }]}>
                      <Text style={[styles.subMenuText, { color: Colors.textMuted }]}>{t('historico_atividade')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Configurações */}
              <View style={styles.menuSection}>
                <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.background }]} onPress={() => toggleSection('config')}>
                  <Ionicons name="settings-outline" size={20} color={Colors.text} />
                  <Text style={[styles.menuText, { color: Colors.text }]}>{t('configuracoes')}</Text>
                  <Ionicons name={configExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Notificações */}
              <View style={styles.menuSection}>
                <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.background }]} onPress={() => toggleSection('notificacoes')}>
                  <Ionicons name="notifications-outline" size={20} color={Colors.text} />
                  <Text style={[styles.menuText, { color: Colors.text }]}>{t('notificacoes')}</Text>
                  <Ionicons name={notificacoesExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Idioma */}
              <View style={styles.menuSection}>
                <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.background }]} onPress={() => toggleSection('idioma')}>
                  <Ionicons name="language-outline" size={20} color={Colors.text} />
                  <Text style={[styles.menuText, { color: Colors.text }]}>{t('idioma')}</Text>
                  <Ionicons name={idiomaExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                {idiomaExpanded && (
                  <View style={styles.subMenu}>
                    {IDIOMAS.map((idioma) => {
                      const ativo = i18n.language === idioma.code;
                      return (
                        <TouchableOpacity
                          key={idioma.code}
                          style={ativo ? styles.subMenuItemActive : [styles.subMenuItem, { backgroundColor: Colors.background }]}
                          onPress={() => handleChangeLanguage(idioma.code)}
                        >
                          <View style={styles.languageItem}>
                            <Text style={styles.flag}>{idioma.flag}</Text>
                            <Text style={ativo ? styles.subMenuTextActive : [styles.subMenuText, { color: Colors.textMuted }]}>{idioma.label}</Text>
                            {ativo && <Ionicons name="checkmark" size={16} color="#4A90E2" style={{ marginLeft: 'auto' }} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Sobre */}
              <View style={styles.menuSection}>
                <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors.background }]}>
                  <Ionicons name="information-circle-outline" size={20} color={Colors.text} />
                  <Text style={[styles.menuText, { color: Colors.text }]}>{t('sobre')}</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>

          {/* Toggle Modo Escuro — acima do botão Sair */}
          <TouchableOpacity
            style={[styles.themeToggle, { borderTopColor: Colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={styles.themeToggleLeft}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={Colors.text}
              />
              <Text style={[styles.themeToggleText, { color: Colors.text }]}>
                {isDark ? 'Modo Claro' : 'Modo Escuro'}
              </Text>
            </View>
            <View style={[styles.toggleSwitch, isDark && { backgroundColor: Colors.primary }]}>
              <View style={[styles.toggleThumb, isDark && styles.toggleThumbOn]} />
            </View>
          </TouchableOpacity>

          {/* Botão Sair */}
          <View style={[styles.logoutContainer, { borderTopColor: Colors.border }]}>
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: Colors.primary }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutText}>{t('sair')}</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Fechar */}
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: Colors.primary }]} onPress={onClose}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Alterar Apelido */}
      <Modal visible={apelidoModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.apelidoOverlay}>
            <View style={[styles.apelidoCard, { backgroundColor: Colors.surface }]}>
              <Text style={[styles.apelidoTitle, { color: Colors.text }]}>Alterar Apelido</Text>
              <Text style={[styles.apelidoSubtitle, { color: Colors.textMuted }]}>Este é o nome que aparecerá no seu painel</Text>
              <TextInput
                style={[styles.apelidoInput, { backgroundColor: Colors.surfaceLight, color: Colors.text }]}
                placeholder="Digite seu apelido"
                placeholderTextColor={Colors.textMuted}
                value={apelidoInput}
                onChangeText={setApelidoInput}
                maxLength={20}
              />
              <TouchableOpacity style={[styles.apelidoBtn, { backgroundColor: Colors.primary }]} onPress={salvarApelido}>
                <Text style={styles.apelidoBtnText}>Salvar apelido</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.apelidoCancelar} onPress={() => setApelidoModalVisible(false)}>
                <Text style={[styles.apelidoCancelarText, { color: Colors.textMuted }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Alterar Senha */}
      <Modal visible={senhaModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.apelidoOverlay}>
            <View style={[styles.senhaCard, { backgroundColor: Colors.surface }]}>
              <Text style={[styles.apelidoTitle, { color: Colors.text }]}>Alterar Senha</Text>
              <Text style={[styles.apelidoSubtitle, { color: Colors.textMuted }]}>Preencha os campos abaixo</Text>
              <View style={[styles.senhaInputWrapper, { backgroundColor: Colors.surfaceLight }]}>
                <TextInput
                  style={[styles.senhaInput, { color: Colors.text }]}
                  placeholder="Senha atual"
                  placeholderTextColor={Colors.textMuted}
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry={!showSenhaAtual}
                />
                <TouchableOpacity onPress={() => setShowSenhaAtual(v => !v)}>
                  <Ionicons name={showSenhaAtual ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={[styles.senhaInputWrapper, { backgroundColor: Colors.surfaceLight }]}>
                <TextInput
                  style={[styles.senhaInput, { color: Colors.text }]}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  placeholderTextColor={Colors.textMuted}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry={!showNovaSenha}
                />
                <TouchableOpacity onPress={() => setShowNovaSenha(v => !v)}>
                  <Ionicons name={showNovaSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={[styles.senhaInputWrapper, { backgroundColor: Colors.surfaceLight }]}>
                <TextInput
                  style={[styles.senhaInput, { color: Colors.text }]}
                  placeholder="Confirmar nova senha"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry={!showConfirmar}
                />
                <TouchableOpacity onPress={() => setShowConfirmar(v => !v)}>
                  <Ionicons name={showConfirmar ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.apelidoBtn, { backgroundColor: Colors.primary, marginTop: 8 }, salvandoSenha && { opacity: 0.6 }]}
                onPress={salvarSenha}
                disabled={salvandoSenha}
              >
                <Text style={styles.apelidoBtnText}>{salvandoSenha ? 'Salvando...' : 'Salvar senha'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.apelidoCancelar} onPress={() => setSenhaModalVisible(false)}>
                <Text style={[styles.apelidoCancelarText, { color: Colors.textMuted }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
  );
}

export default function SimpleSidebar({ visible, onClose, onLogout, onApelidoChange }) {
  return <SidebarContent visible={visible} onClose={onClose} onLogout={onLogout} onApelidoChange={onApelidoChange} />;
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-start' },
  sidebar: { width: SIDEBAR_WIDTH, height: '100%', elevation: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 },
  content: { flex: 1 },
  profileHeader: { padding: 16, alignItems: 'center', borderBottomWidth: 1 },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
  profileName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  profileEmail: { fontSize: 14 },
  menuContainer: { flex: 1, padding: 16 },
  menuSection: { marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 4 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', marginLeft: 12 },
  subMenu: { marginLeft: 32, marginTop: 8 },
  subMenuItem: { padding: 12, borderRadius: 8, marginBottom: 4 },
  subMenuItemActive: { padding: 12, borderRadius: 8, backgroundColor: '#e8f0fe', marginBottom: 4, borderLeftWidth: 3, borderLeftColor: '#4A90E2' },
  subMenuText: { fontSize: 14 },
  subMenuTextActive: { fontSize: 14, color: '#4A90E2', fontWeight: '700' },
  languageItem: { flexDirection: 'row', alignItems: 'center' },
  flag: { fontSize: 20, marginRight: 12 },

  // Toggle tema
  themeToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  themeToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggleText: { fontSize: 15, fontWeight: '500' },
  toggleSwitch: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#e2e8f0', justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' },
  toggleThumbOn: { alignSelf: 'flex-end' },

  logoutContainer: { padding: 16, borderTopWidth: 1 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  closeButton: { position: 'absolute', top: 28, right: 16, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },

  apelidoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  apelidoCard: { borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  apelidoTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  apelidoSubtitle: { fontSize: 13, marginBottom: 20, textAlign: 'center' },
  apelidoInput: { width: '100%', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  apelidoBtn: { width: '100%', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 8 },
  apelidoBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  apelidoCancelar: { padding: 10 },
  apelidoCancelarText: { fontSize: 14 },

  senhaCard: { borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  senhaInputWrapper: { flexDirection: 'row', alignItems: 'center', width: '100%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12 },
  senhaInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
});
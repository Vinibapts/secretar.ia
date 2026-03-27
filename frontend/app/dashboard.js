import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Keyboard, TouchableWithoutFeedback,
  KeyboardAvoidingView, Platform, Image, Linking,
  Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '../constants/colors';
import { getEvents, getResumo } from '../services/api';
import { fetchNews } from '../services/newsService';
import AnimatedNewsSection from '../components/AnimatedNewsSection';
import SimpleSidebar from '../components/SimpleSidebar';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function DashboardScreen({ onLogout }) {
  const Colors = useColors();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [events, setEvents] = useState([]);
  const [resumo, setResumo] = useState({ total_receitas: 0, total_gastos: 0, saldo: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [news, setNews] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Modal apelido (primeira vez)
  const [apelidoModalVisible, setApelidoModalVisible] = useState(false);
  const [apelidoInput, setApelidoInput] = useState('');

  const getHora = () => {
    const h = new Date().getHours();
    if (h < 12) return t('bom_dia');
    if (h < 18) return t('boa_tarde');
    return t('boa_noite');
  };

  useEffect(() => {
    verificarApelido();
  }, []);

  const verificarApelido = async () => {
    const apelido = await AsyncStorage.getItem('apelidoUsuario');
    if (apelido) {
      setNomeUsuario(apelido);
    } else {
      setApelidoModalVisible(true);
    }
  };

  const salvarApelido = async () => {
    const apelido = apelidoInput.trim();
    if (!apelido) return;
    await AsyncStorage.setItem('apelidoUsuario', apelido);
    await AsyncStorage.setItem('nomeUsuario', apelido);
    setNomeUsuario(apelido);
    setApelidoModalVisible(false);
  };

  // ← Callback chamado pelo Sidebar quando o apelido é alterado lá
  const handleApelidoChange = (novoApelido) => {
    setNomeUsuario(novoApelido);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    if (loading || refreshing) return;
    try {
      setLoading(true);
      setRefreshing(true);
      const [eventsRes, resumoRes, newsRes] = await Promise.all([
        getEvents(),
        getResumo(),
        fetchNews(),
      ]);
      setEvents(eventsRes.data);
      setResumo(resumoRes.data);
      setNews(newsRes);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = [
    { label: t('eventos_hoje'), value: String(events.filter(e => new Date(e.data_inicio).toDateString() === new Date().toDateString()).length), icon: 'calendar', color: Colors.primary, bg: Colors.primaryLight },
    { label: t('saldo_mes'),    value: `R$ ${resumo.saldo.toFixed(0)}`,          icon: 'wallet',       color: Colors.warning, bg: Colors.warningLight },
    { label: t('receitas'),     value: `R$ ${resumo.total_receitas.toFixed(0)}`, icon: 'trending-up',  color: Colors.success, bg: Colors.successLight },
    { label: t('gastos'),       value: `R$ ${resumo.total_gastos.toFixed(0)}`,   icon: 'trending-down',color: Colors.danger,  bg: Colors.dangerLight  },
  ];

  const shortcuts = [
    { label: t('agenda'),   icon: 'calendar', color: Colors.accent,  bg: Colors.surfaceLight, tab: 'Agenda'  },
    { label: t('financas'), icon: 'wallet',   color: Colors.warning, bg: Colors.warningLight,  tab: 'Finanças'},
    { label: t('ranking'),  icon: 'trophy',   color: Colors.primary, bg: Colors.primaryLight,  tab: 'Ranking' },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greetingContainer: { flex: 1, marginRight: 8 },
    greeting: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
    subGreeting: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: 20, padding: 16, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
    statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statNumber: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
    statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    sectionLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
    shortcuts: { flexDirection: 'row', gap: 10 },
    shortcut: { flex: 1, backgroundColor: Colors.surface, borderRadius: 18, padding: 12, alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
    shortcutIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    shortcutLabel: { fontSize: 11, color: Colors.text, fontWeight: '600' },
    eventCard: { flexDirection: 'row', alignItems: 'center', gap: 0, backgroundColor: Colors.surface, borderRadius: 16, marginBottom: 8, overflow: 'hidden', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
    eventTimeBox: { width: 56, paddingVertical: 16, alignItems: 'center', backgroundColor: Colors.primaryLight },
    eventTimeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    eventBar: { width: 3, alignSelf: 'stretch', backgroundColor: Colors.primary },
    eventContent: { flex: 1, padding: 12 },
    eventTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
    eventDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    emptyCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 32, alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
    emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 10, fontWeight: '600' },
    emptySubtext: { color: Colors.textMuted, fontSize: 12, marginTop: 4, opacity: 0.7 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    modalCard: { backgroundColor: Colors.surface, borderRadius: 28, padding: 28, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    modalEmoji: { fontSize: 52, marginBottom: 12 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 21 },
    modalInput: { width: '100%', backgroundColor: Colors.surfaceLight, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: Colors.text, marginBottom: 16, textAlign: 'center' },
    modalBtn: { width: '100%', backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    modalBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarVisible(true)}>
            <Image source={require('../assets/fotoperfil.png')} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting} numberOfLines={1}>
              {getHora()}{nomeUsuario ? `, ${nomeUsuario}` : ''}
            </Text>
            <Text style={styles.subGreeting}>{t('aqui_esta_painel')}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((card, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={20} color={card.color} />
              </View>
              <Text style={styles.statNumber}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('acesso_rapido')}</Text>
          <View style={styles.shortcuts}>
            {shortcuts.map((s) => (
              <TouchableOpacity key={s.label} style={styles.shortcut} onPress={() => navigation?.navigate(s.tab)}>
                <View style={[styles.shortcutIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.shortcutLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <AnimatedNewsSection />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('proximos_compromissos')}</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Agenda')}>
              <Text style={styles.sectionLink}>{t('ver_todos')}</Text>
            </TouchableOpacity>
          </View>

          {events.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={36} color={Colors.textMuted} style={{ opacity: 0.4 }} />
              <Text style={styles.emptyText}>{t('nenhum_evento')}</Text>
              <Text style={styles.emptySubtext}>{t('use_botao_voz')}</Text>
            </View>
          ) : (
            events.slice(0, 5).map((evt, i) => (
              <TouchableOpacity key={i} style={styles.eventCard} onPress={() => navigation?.navigate('Agenda')} activeOpacity={0.7}>
                <View style={styles.eventTimeBox}>
                  <Text style={styles.eventTimeText}>
                    {new Date(evt.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.eventBar} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{evt.titulo}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(evt.data_inicio).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>

      {/* ← onApelidoChange avisa o Dashboard quando o apelido muda no Sidebar */}
      <SimpleSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={onLogout}
        onApelidoChange={handleApelidoChange}
      />

      {/* Modal apelido — primeira vez */}
      <Modal visible={apelidoModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>👋</Text>
            <Text style={styles.modalTitle}>Como quer ser chamado?</Text>
            <Text style={styles.modalSubtitle}>
              Escolha um apelido.{'\n'}Vamos te chamar assim para sempre!
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Vinicius, Vini, Vin..."
              placeholderTextColor={Colors.textMuted}
              value={apelidoInput}
              onChangeText={setApelidoInput}
              autoFocus
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={salvarApelido}
            />
            <TouchableOpacity
              style={[styles.modalBtn, !apelidoInput.trim() && { opacity: 0.4 }]}
              onPress={salvarApelido}
              disabled={!apelidoInput.trim()}
            >
              <Text style={styles.modalBtnText}>Salvar apelido 🚀</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
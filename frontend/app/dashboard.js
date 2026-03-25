import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '../constants/colors';
import { getEvents, getResumo } from '../services/api';

export default function DashboardScreen({ navigation, onLogout }) {
  const Colors = useColors();

  const [events, setEvents] = useState([]);
  const [resumo, setResumo] = useState({ total_receitas: 0, total_gastos: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [hora, setHora] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setHora(h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite');
    AsyncStorage.getItem('nomeUsuario').then(nome => {
      if (nome) setNomeUsuario(nome.split(' ')[0]);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [eventsRes, resumoRes] = await Promise.all([
        getEvents(),
        getResumo(),
      ]);
      setEvents(eventsRes.data);
      setResumo(resumoRes.data);
    } catch (err) {
      console.log('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('keepConnected');
    onLogout?.();
  };

  const statCards = [
    { label: 'Eventos hoje', value: String(events.filter(e => new Date(e.data_inicio).toDateString() === new Date().toDateString()).length), icon: 'calendar', color: Colors.primary, bg: Colors.primaryLight },
    { label: 'Saldo do mês', value: `R$ ${resumo.saldo.toFixed(0)}`, icon: 'wallet', color: Colors.warning, bg: Colors.warningLight },
    { label: 'Receitas', value: `R$ ${resumo.total_receitas.toFixed(0)}`, icon: 'trending-up', color: Colors.success, bg: Colors.successLight },
    { label: 'Gastos', value: `R$ ${resumo.total_gastos.toFixed(0)}`, icon: 'trending-down', color: Colors.danger, bg: Colors.dangerLight },
  ];

  const shortcuts = [
    { label: 'Agenda', icon: 'calendar', color: Colors.accent, bg: Colors.surfaceLight, tab: 'Agenda' },
    { label: 'Finanças', icon: 'wallet', color: Colors.warning, bg: Colors.warningLight, tab: 'Finanças' },
    { label: 'Ranking', icon: 'trophy', color: Colors.primary, bg: Colors.primaryLight, tab: 'Ranking' },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
    subGreeting: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
    logoutBtn: { padding: 8 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: {
      flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
      borderRadius: 20, padding: 16,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 16, elevation: 3,
    },
    statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statNumber: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
    statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    sectionLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
    shortcuts: { flexDirection: 'row', gap: 10 },
    shortcut: {
      flex: 1, backgroundColor: Colors.surface, borderRadius: 18,
      padding: 12, alignItems: 'center',
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    shortcutIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    shortcutLabel: { fontSize: 11, color: Colors.text, fontWeight: '600' },
    eventCard: {
      flexDirection: 'row', alignItems: 'center', gap: 0,
      backgroundColor: Colors.surface, borderRadius: 16,
      marginBottom: 8, overflow: 'hidden',
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    eventTimeBox: {
      width: 56, paddingVertical: 16,
      alignItems: 'center', backgroundColor: Colors.primaryLight,
    },
    eventTimeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    eventBar: { width: 3, alignSelf: 'stretch', backgroundColor: Colors.primary },
    eventContent: { flex: 1, padding: 12 },
    eventTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
    eventDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    emptyCard: {
      backgroundColor: Colors.surface, borderRadius: 20, padding: 32,
      alignItems: 'center',
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 10, fontWeight: '600' },
    emptySubtext: { color: Colors.textMuted, fontSize: 12, marginTop: 4, opacity: 0.7 },
    themeButtons: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    themeButton: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    },
    themeButtonActive: {
      backgroundColor: Colors.primary, borderColor: Colors.primary,
    },
    themeButtonText: {
      fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginLeft: 8
    },
    themeButtonTextActive: {
      color: Colors.white,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{hora}{nomeUsuario ? `, ${nomeUsuario}` : ''} 👋</Text>
            <Text style={styles.subGreeting}>Aqui está o seu painel</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
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
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.shortcuts}>
            {shortcuts.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.shortcut}
                onPress={() => navigation?.navigate(s.tab)}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.shortcutLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos compromissos</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Agenda')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {events.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={36} color={Colors.textMuted} style={{ opacity: 0.4 }} />
              <Text style={styles.emptyText}>Nenhum evento cadastrado</Text>
              <Text style={styles.emptySubtext}>Use o botão de voz para criar compromissos</Text>
            </View>
          ) : (
            events.slice(0, 5).map((evt, i) => (
              <View key={i} style={styles.eventCard}>
                <View style={styles.eventTimeBox}>
                  <Text style={styles.eventTimeText}>
                    {new Date(evt.data_inicio).toLocaleTimeString('pt-BR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.eventBar} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{evt.titulo}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(evt.data_inicio).toLocaleDateString('pt-BR', {
                      weekday: 'short', day: '2-digit', month: 'short'
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { getEvents, getTasks, getResumo } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resumo, setResumo] = useState({ total_receitas: 0, total_gastos: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [hora, setHora] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setHora(h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, tasksRes, resumoRes] = await Promise.all([
        getEvents(),
        getTasks(),
        getResumo(),
      ]);
      setEvents(eventsRes.data.slice(0, 3));
      setTasks(tasksRes.data.filter(t => t.status !== 'concluido').slice(0, 3));
      setResumo(resumoRes.data);
    } catch (err) {
      console.log('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation?.navigate('Login');
  };

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

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{hora}, Vinícius 👋</Text>
            <Text style={styles.subGreeting}>Aqui está o resumo do seu dia</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.statNumber}>{events.length}</Text>
            <Text style={styles.statLabel}>Eventos hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tarefas pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={20} color={Colors.warning} />
            <Text style={styles.statNumber}>R$ {resumo.saldo.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Saldo do mês</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={20} color={Colors.danger} />
            <Text style={styles.statNumber}>0/0</Text>
            <Text style={styles.statLabel}>Hábitos hoje</Text>
          </View>
        </View>

        {/* Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.shortcuts}>
            {[
              { label: 'Chat IA', icon: 'chatbubble-ellipses', color: Colors.primary, tab: 'Chat' },
              { label: 'Agenda', icon: 'calendar', color: Colors.accent, tab: 'Agenda' },
              { label: 'Tarefas', icon: 'checkmark-circle', color: Colors.success, tab: 'Tarefas' },
              { label: 'Finanças', icon: 'wallet', color: Colors.warning, tab: 'Finanças' },
            ].map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.shortcut}
                onPress={() => navigation?.navigate(s.tab)}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: s.color + '20' }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.shortcutLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Próximos eventos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos compromissos</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Agenda')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {events.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum evento cadastrado</Text>
            </View>
          ) : (
            events.map((evt, i) => (
              <View key={i} style={styles.eventCard}>
                <View style={styles.eventTime}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.eventTimeText}>
                    {new Date(evt.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.eventTitle}>{evt.titulo}</Text>
              </View>
            ))
          )}
        </View>

        {/* Tarefas pendentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tarefas pendentes</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Tarefas')}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma tarefa pendente</Text>
            </View>
          ) : (
            tasks.map((task, i) => (
              <View key={i} style={styles.taskCard}>
                <View style={[styles.taskDot, {
                  backgroundColor: task.prioridade === 'alta' ? Colors.danger : Colors.warning
                }]} />
                <Text style={styles.taskTitle}>{task.titulo}</Text>
                <View style={[styles.taskBadge, {
                  backgroundColor: task.prioridade === 'alta' ? Colors.danger + '20' : Colors.warning + '20'
                }]}>
                  <Text style={[styles.taskBadgeText, {
                    color: task.prioridade === 'alta' ? Colors.danger : Colors.warning
                  }]}>{task.prioridade}</Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  subGreeting: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  logoutBtn: { padding: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginTop: 8 },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  sectionLink: { fontSize: 13, color: Colors.primary },
  shortcuts: { flexDirection: 'row', gap: 12 },
  shortcut: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  shortcutIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  shortcutLabel: { fontSize: 12, color: Colors.text, fontWeight: '500' },
  eventCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  eventTime: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  eventTimeText: { fontSize: 12, color: Colors.textMuted },
  eventTitle: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskTitle: { flex: 1, fontSize: 14, color: Colors.text },
  taskBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  taskBadgeText: { fontSize: 11, fontWeight: '600' },
  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 8 },
});
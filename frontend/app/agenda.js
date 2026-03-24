import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getEvents, createEvent, deleteEvent } from '../services/api';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const dotColors = [Colors.primary, Colors.accent, Colors.success, Colors.warning, Colors.danger];

function getWeekDays(baseDate) {
  const days = [];
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function AgendaScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekBase, setWeekBase] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch (err) {
      console.log('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!titulo || !dataInicio) {
      Alert.alert('Atenção', 'Preencha o título e a data!');
      return;
    }
    setSaving(true);
    try {
      await createEvent({
        titulo,
        descricao,
        data_inicio: new Date(dataInicio).toISOString(),
      });
      setModalVisible(false);
      setTitulo('');
      setDescricao('');
      setDataInicio('');
      loadEvents();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível criar o evento!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir evento', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => { await deleteEvent(id); loadEvents(); }
      }
    ]);
  };

  const weekDays = getWeekDays(weekBase);

  const selectedStr = selectedDate.toDateString();
  const dayEvents = events.filter(evt => {
    return new Date(evt.data_inicio).toDateString() === selectedStr;
  });

  const hasEvents = (date) => {
    return events.some(evt => new Date(evt.data_inicio).toDateString() === date.toDateString());
  };

  const isToday = (date) => new Date().toDateString() === date.toDateString();
  const isSelected = (date) => selectedDate.toDateString() === date.toDateString();

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const prevWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  };

  const nextWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.subtitle}>
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Semana horizontal */}
      <View style={styles.weekContainer}>
        <TouchableOpacity onPress={prevWeek} style={styles.weekArrow}>
          <Ionicons name="chevron-back" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.weekDays}>
          {weekDays.map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayBtn,
                isSelected(day) && styles.dayBtnSelected,
                isToday(day) && !isSelected(day) && styles.dayBtnToday,
              ]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[
                styles.dayName,
                isSelected(day) && styles.dayNameSelected,
              ]}>
                {DAYS[day.getDay()]}
              </Text>
              <Text style={[
                styles.dayNum,
                isSelected(day) && styles.dayNumSelected,
                isToday(day) && !isSelected(day) && styles.dayNumToday,
              ]}>
                {day.getDate()}
              </Text>
              {hasEvents(day) && (
                <View style={[
                  styles.eventDot,
                  isSelected(day) && { backgroundColor: Colors.white }
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={nextWeek} style={styles.weekArrow}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Dia selecionado */}
      <View style={styles.selectedDayHeader}>
        <Text style={styles.selectedDayText}>
          {DAYS[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
        </Text>
        <Text style={styles.eventCount}>
          {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {dayEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum evento</Text>
              <Text style={styles.emptySubtitle}>Toque no + para adicionar um compromisso</Text>
            </View>
          ) : (
            dayEvents.map((evt, i) => (
              <View key={evt.id} style={styles.eventCard}>
                <View style={styles.eventTimeCol}>
                  <Text style={styles.eventTime}>{formatTime(evt.data_inicio)}</Text>
                </View>
                <View style={[styles.eventBar, { backgroundColor: dotColors[i % dotColors.length] }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{evt.titulo}</Text>
                  {evt.descricao && !evt.descricao.startsWith('{') ? (
                    <Text style={styles.eventDesc}>{evt.descricao}</Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => handleDelete(evt.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Todos os eventos */}
          {events.length > 0 && (
            <View style={styles.allEventsSection}>
              <Text style={styles.allEventsTitle}>Todos os eventos</Text>
              {events.map((evt, i) => (
                <View key={evt.id} style={styles.allEventRow}>
                  <View style={[styles.allEventDot, { backgroundColor: dotColors[i % dotColors.length] }]} />
                  <View style={styles.allEventContent}>
                    <Text style={styles.allEventTitle}>{evt.titulo}</Text>
                    <Text style={styles.allEventDate}>
                      {new Date(evt.data_inicio).toLocaleDateString('pt-BR', {
                        weekday: 'short', day: '2-digit', month: 'short'
                      })} às {formatTime(evt.data_inicio)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(evt.id)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal criar evento */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo evento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Reunião com equipe"
              placeholderTextColor={Colors.textMuted}
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Detalhes do evento..."
              placeholderTextColor={Colors.textMuted}
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />

            <Text style={styles.label}>Data e hora * (AAAA-MM-DD HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2026-03-25 14:00"
              placeholderTextColor={Colors.textMuted}
              value={dataInicio}
              onChangeText={setDataInicio}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Salvar evento</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 20, paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  weekContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  weekArrow: { padding: 8, paddingHorizontal: 6 },
  weekDays: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  dayBtn: {
    alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4,
    borderRadius: 14, minWidth: 36,
  },
  dayBtnSelected: { backgroundColor: Colors.primary },
  dayBtnToday: { backgroundColor: Colors.primaryLight },
  dayName: { fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginBottom: 4 },
  dayNameSelected: { color: Colors.white },
  dayNum: { fontSize: 15, fontWeight: '700', color: Colors.text },
  dayNumSelected: { color: Colors.white },
  dayNumToday: { color: Colors.primary },
  eventDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: Colors.primary, marginTop: 3,
  },
  selectedDayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  selectedDayText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  eventCount: { fontSize: 12, color: Colors.textMuted },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptySubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },
  eventCard: {
    flexDirection: 'row', alignItems: 'stretch',
    backgroundColor: Colors.white, borderRadius: 16, marginBottom: 10,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
    overflow: 'hidden',
  },
  eventTimeCol: {
    width: 56, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, backgroundColor: Colors.surfaceLight,
  },
  eventTime: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  eventBar: { width: 4 },
  eventContent: { flex: 1, padding: 12 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  eventDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  deleteBtn: { padding: 14, justifyContent: 'center' },
  allEventsSection: { marginTop: 24 },
  allEventsTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  allEventRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: 14, padding: 12, marginBottom: 8,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  allEventDot: { width: 10, height: 10, borderRadius: 5 },
  allEventContent: { flex: 1 },
  allEventTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
  allEventDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 13, color: Colors.text, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: Colors.surfaceLight, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    color: Colors.text, fontSize: 15,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
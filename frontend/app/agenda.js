import { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator, Dimensions, Animated,
  KeyboardAvoidingView, Platform,
  Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../constants/colors';
import { getEvents, createEvent, deleteEvent } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../i18n';

const { width } = Dimensions.get('window');
const DAY_SIZE = Math.floor((width - 40) / 7);

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), current: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), current: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: new Date(year, month + 1, i), current: false });
  }
  return cells;
}

function getWeekRow(cells, selectedDate) {
  const selectedStr = selectedDate.toDateString();
  const idx = cells.findIndex(c => c.date.toDateString() === selectedStr);
  const row = Math.floor(idx / 7);
  return cells.slice(row * 7, row * 7 + 7);
}

export default function AgendaScreen() {
  const Colors = useColors();
  const { t } = useTranslation();
  const dotColors = [Colors.primary, Colors.accent, Colors.success, Colors.warning, Colors.danger];

  // Arrays traduzidos dentro do componente para reagir à troca de idioma
  const DAYS_HEADER = [t('dom'), t('seg'), t('ter'), t('qua'), t('qui'), t('sex'), t('sab')];
  const DAYS_FULL   = [t('domingo'), t('segunda'), t('terca'), t('quarta'), t('quinta'), t('sexta'), t('sabado')];
  const MONTHS      = [t('janeiro'), t('fevereiro'), t('marco'), t('abril'), t('maio'), t('junho'),
                       t('julho'), t('agosto'), t('setembro'), t('outubro'), t('novembro'), t('dezembro')];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => { loadEvents(); }, [])
  );

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
      Alert.alert(t('atencao'), t('preencha_titulo_data'));
      return;
    }
    setSaving(true);
    try {
      await createEvent({
        titulo, descricao,
        data_inicio: new Date(dataInicio).toISOString(),
      });
      setModalVisible(false);
      setTitulo(''); setDescricao(''); setDataInicio('');
      loadEvents();
    } catch {
      Alert.alert(t('erro'), t('erro_criar_evento'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(t('excluir_evento'), t('tem_certeza'), [
      { text: t('cancelar'), style: 'cancel' },
      { text: t('excluir'), style: 'destructive', onPress: async () => { await deleteEvent(id); loadEvents(); } }
    ]);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else { setCurrentMonth(m => m - 1); }
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else { setCurrentMonth(m => m + 1); }
  };

  const cells = getMonthDays(currentYear, currentMonth);
  const selectedStr = selectedDate.toDateString();
  const today = new Date();

  const hasEvents = (date) =>
    events.some(evt => new Date(evt.data_inicio).toDateString() === date.toDateString());

  const dayEvents = events
    .filter(evt => new Date(evt.data_inicio).toDateString() === selectedStr)
    .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const weekRow = getWeekRow(cells, selectedDate);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    navArrow: { padding: 6 },
    headerTitleBox: { alignItems: 'center', minWidth: 120 },
    monthTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
    yearTitle: { fontSize: 13, color: Colors.textMuted, marginTop: 1 },
    addBtn: {
      width: 44, height: 44, borderRadius: 14,
      backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
      shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    calendarContainer: {
      backgroundColor: Colors.surface, paddingHorizontal: 16, paddingBottom: 4,
    },
    weekHeader: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
    weekHeaderText: {
      width: DAY_SIZE, textAlign: 'center',
      fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: {
      width: DAY_SIZE, height: DAY_SIZE + 8,
      alignItems: 'center', justifyContent: 'center',
      borderRadius: 10, position: 'relative',
    },
    dayCellSelected: { backgroundColor: Colors.primary },
    todayRing: {
      position: 'absolute',
      width: DAY_SIZE - 4, height: DAY_SIZE - 4,
      borderRadius: 9, borderWidth: 1.5, borderColor: Colors.primary,
    },
    dayText: { fontSize: 14, fontWeight: '600', color: Colors.text },
    dayTextFaded: { color: Colors.border },
    dayTextSelected: { color: Colors.white, fontWeight: '700' },
    dayTextToday: { color: Colors.primary, fontWeight: '800' },
    eventDot: {
      width: 5, height: 5, borderRadius: 3,
      backgroundColor: Colors.primary, position: 'absolute', bottom: 3,
    },
    expandBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 6, gap: 4,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    expandBtnText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
    divider: { height: 8, backgroundColor: Colors.background },
    eventsSection: { backgroundColor: Colors.surface, paddingHorizontal: 20, paddingTop: 16 },
    eventsDayHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 16,
    },
    eventsDayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    eventsDayNum: { fontSize: 36, fontWeight: 'bold', color: Colors.primary },
    eventsDayName: { fontSize: 15, fontWeight: '700', color: Colors.text },
    eventsDayMonth: { fontSize: 13, color: Colors.textMuted },
    eventsCount: { fontSize: 12, color: Colors.textMuted },
    emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
    emptySubtext: { fontSize: 12, color: Colors.textMuted, opacity: 0.7 },
    eventRow: {
      flexDirection: 'row', alignItems: 'stretch',
      backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 10,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden',
      borderWidth: 1, borderColor: Colors.border,
    },
    eventTimeCol: {
      width: 54, alignItems: 'center', justifyContent: 'center',
      paddingVertical: 14, backgroundColor: Colors.surfaceLight,
    },
    eventTime: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    eventStripe: { width: 4 },
    eventContent: { flex: 1, padding: 12 },
    eventTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
    eventDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
    deleteBtn: { padding: 14, justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: {
      backgroundColor: Colors.surface, borderTopLeftRadius: 28,
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
      backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center',
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

  const renderDayCell = (cell, i) => {
    const isSelected = cell.date.toDateString() === selectedStr;
    const isToday = cell.date.toDateString() === today.toDateString();
    const hasDot = hasEvents(cell.date);
    const isSunday = cell.date.getDay() === 0;
    const isSaturday = cell.date.getDay() === 6;

    return (
      <TouchableOpacity
        key={i}
        style={[styles.dayCell, isSelected && styles.dayCellSelected]}
        onPress={() => {
          setSelectedDate(cell.date);
          if (cell.date.getMonth() !== currentMonth) {
            setCurrentMonth(cell.date.getMonth());
            setCurrentYear(cell.date.getFullYear());
          }
        }}
      >
        {isToday && !isSelected && <View style={styles.todayRing} />}
        <Text style={[
          styles.dayText,
          !cell.current && styles.dayTextFaded,
          isSelected && styles.dayTextSelected,
          isToday && !isSelected && styles.dayTextToday,
          isSunday && !isSelected && cell.current && { color: Colors.danger },
          isSaturday && !isSelected && cell.current && { color: Colors.primary },
        ]}>
          {cell.date.getDate()}
        </Text>
        {hasDot && (
          <View style={[styles.eventDot, isSelected && { backgroundColor: Colors.white }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={prevMonth} style={styles.navArrow}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.monthTitle}>{MONTHS[currentMonth]}</Text>
            <Text style={styles.yearTitle}>{currentYear}</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={styles.navArrow}>
            <Ionicons name="chevron-forward" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <View style={styles.weekHeader}>
            {DAYS_HEADER.map((d, i) => (
              <Text key={i} style={[
                styles.weekHeaderText,
                i === 0 && { color: Colors.danger },
                i === 6 && { color: Colors.primary },
              ]}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {(expanded ? cells : weekRow).map((cell, i) => renderDayCell(cell, i))}
          </View>
        </View>

        <TouchableOpacity style={styles.expandBtn} onPress={() => setExpanded(e => !e)}>
          <Text style={styles.expandBtnText}>
            {expanded ? t('recolher_calendario') : t('ver_mes_completo')}
          </Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.eventsSection}>
          <View style={styles.eventsDayHeader}>
            <View style={styles.eventsDayLeft}>
              <Text style={styles.eventsDayNum}>{selectedDate.getDate()}</Text>
              <View>
                <Text style={styles.eventsDayName}>{DAYS_FULL[selectedDate.getDay()]}</Text>
                <Text style={styles.eventsDayMonth}>{MONTHS[selectedDate.getMonth()]}</Text>
              </View>
            </View>
            <Text style={styles.eventsCount}>
              {dayEvents.length} {dayEvents.length === 1 ? t('evento') : t('eventos')}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : dayEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={32} color={Colors.textMuted} style={{ opacity: 0.4 }} />
              <Text style={styles.emptyText}>{t('nenhum_evento')}</Text>
              <Text style={styles.emptySubtext}>{t('use_microfone')}</Text>
            </View>
          ) : (
            dayEvents.map((evt, i) => (
              <View key={evt.id} style={styles.eventRow}>
                <View style={styles.eventTimeCol}>
                  <Text style={styles.eventTime}>{formatTime(evt.data_inicio)}</Text>
                </View>
                <View style={[styles.eventStripe, { backgroundColor: dotColors[i % dotColors.length] }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{evt.titulo}</Text>
                  {evt.descricao && !evt.descricao.startsWith('{') && (
                    <Text style={styles.eventDesc}>{evt.descricao}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(evt.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('novo_evento')}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.label}>{t('titulo')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('placeholder_titulo')}
                  placeholderTextColor={Colors.textMuted}
                  value={titulo}
                  onChangeText={setTitulo}
                />
                <Text style={styles.label}>{t('descricao')}</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder={t('placeholder_descricao')}
                  placeholderTextColor={Colors.textMuted}
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline
                />
                <Text style={styles.label}>{t('data_hora')} * (AAAA-MM-DD HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 2026-03-25 14:00"
                  placeholderTextColor={Colors.textMuted}
                  value={dataInicio}
                  onChangeText={setDataInicio}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color={Colors.white} />
                    : <Text style={styles.saveBtnText}>{t('salvar_evento')}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
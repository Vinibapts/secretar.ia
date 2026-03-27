import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { getHabits, createHabit, logHabit, deleteHabit } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function HabitsScreen() {
  const Colors = useColors();
  const { t } = useTranslation();

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [frequencia, setFrequencia] = useState('diario');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      const res = await getHabits();
      setHabits(res.data);
    } catch (err) {
      console.log('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!nome) { Alert.alert(t('atencao'), t('preencha_nome_habito')); return; }
    setSaving(true);
    try {
      await createHabit({ nome, frequencia });
      setModalVisible(false);
      setNome('');
      setFrequencia('diario');
      loadHabits();
    } catch {
      Alert.alert(t('erro'), t('erro_criar_habito'));
    } finally {
      setSaving(false);
    }
  };

  const handleLog = async (id) => {
    try {
      await logHabit(id, { concluido: true });
      Alert.alert(t('habito_marcado'), t('continue_assim'));
      loadHabits();
    } catch (err) {
      console.log('Erro:', err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(t('excluir_habito'), t('tem_certeza'), [
      { text: t('cancelar'), style: 'cancel' },
      { text: t('excluir'), style: 'destructive', onPress: async () => { await deleteHabit(id); loadHabits(); } }
    ]);
  };

  const habitConfigs = [
    { icon: 'water-outline',     color: Colors.primary, bg: Colors.primaryLight },
    { icon: 'barbell-outline',   color: Colors.success, bg: Colors.successLight },
    { icon: 'moon-outline',      color: Colors.accent,  bg: Colors.surfaceLight },
    { icon: 'book-outline',      color: Colors.warning, bg: Colors.warningLight },
    { icon: 'leaf-outline',      color: Colors.success, bg: Colors.successLight },
    { icon: 'heart-outline',     color: Colors.danger,  bg: Colors.dangerLight  },
    { icon: 'walk-outline',      color: Colors.primary, bg: Colors.primaryLight },
    { icon: 'nutrition-outline', color: Colors.warning, bg: Colors.warningLight },
  ];

  const frequencias = [
    { key: 'diario',   label: t('freq_diario')  },
    { key: 'semanal',  label: t('freq_semanal') },
    { key: 'mensal',   label: t('freq_mensal')  },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'flex-start', padding: 20, paddingBottom: 12,
      backgroundColor: Colors.surface,
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
    summaryRow: {
      flexDirection: 'row', gap: 10,
      paddingHorizontal: 20, paddingVertical: 14,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    summaryCard: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: 14, padding: 12, alignItems: 'center' },
    summaryNumber: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    summaryLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: 20, paddingBottom: 40 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyIcon: {
      width: 80, height: 80, borderRadius: 24,
      backgroundColor: Colors.dangerLight,
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },
    habitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    habitCard: {
      width: '47%', backgroundColor: Colors.surface, borderRadius: 20,
      padding: 16, alignItems: 'center',
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
    },
    habitIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    habitName: { fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 2 },
    habitFreq: { fontSize: 11, color: Colors.textMuted, marginBottom: 12 },
    habitActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    markBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
    markBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
    deleteBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
    closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: 13, color: Colors.text, fontWeight: '600', marginBottom: 6, marginTop: 14 },
    input: { backgroundColor: Colors.surfaceLight, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: Colors.text, fontSize: 15 },
    freqRow: { flexDirection: 'row', gap: 10 },
    freqBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.surface },
    freqBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
    freqBtnText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
    freqBtnTextActive: { color: Colors.primary, fontWeight: '700' },
    saveBtn: {
      backgroundColor: Colors.primary, borderRadius: 14,
      padding: 16, alignItems: 'center', marginTop: 24,
      shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('habitos')}</Text>
          <Text style={styles.subtitle}>{t('acompanhe_habitos')}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{habits.length}</Text>
          <Text style={styles.summaryLabel}>{t('total')}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{habits.filter(h => h.frequencia === 'diario').length}</Text>
          <Text style={styles.summaryLabel}>{t('diarios')}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>🔥 0</Text>
          <Text style={styles.summaryLabel}>Streak</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {habits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={40} color={Colors.danger} />
              </View>
              <Text style={styles.emptyTitle}>{t('nenhum_habito')}</Text>
              <Text style={styles.emptySubtitle}>{t('toque_para_adicionar_habito')}</Text>
            </View>
          ) : (
            <View style={styles.habitsGrid}>
              {habits.map((habit, i) => {
                const cfg = habitConfigs[i % habitConfigs.length];
                return (
                  <View key={habit.id} style={styles.habitCard}>
                    <View style={[styles.habitIcon, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={28} color={cfg.color} />
                    </View>
                    <Text style={styles.habitName}>{habit.nome}</Text>
                    <Text style={styles.habitFreq}>{habit.frequencia}</Text>
                    <View style={styles.habitActions}>
                      <TouchableOpacity
                        style={[styles.markBtn, { backgroundColor: cfg.color }]}
                        onPress={() => handleLog(habit.id)}
                      >
                        <Ionicons name="checkmark" size={14} color={Colors.white} />
                        <Text style={styles.markBtnText}>{t('marcar')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(habit.id)}>
                        <Ionicons name="trash-outline" size={15} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('novo_habito')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>{t('nome_habito')} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t('placeholder_habito')}
              placeholderTextColor={Colors.textMuted}
              value={nome}
              onChangeText={setNome}
            />
            <Text style={styles.label}>{t('frequencia')}</Text>
            <View style={styles.freqRow}>
              {frequencias.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.freqBtn, frequencia === f.key && styles.freqBtnActive]}
                  onPress={() => setFrequencia(f.key)}
                >
                  <Text style={[styles.freqBtnText, frequencia === f.key && styles.freqBtnTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
              {saving
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.saveBtnText}>{t('salvar_habito')}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
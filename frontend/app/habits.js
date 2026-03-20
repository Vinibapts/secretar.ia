import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getHabits, createHabit, logHabit, deleteHabit } from '../services/api';

export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [frequencia, setFrequencia] = useState('diario');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

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
    if (!nome) {
      Alert.alert('Atenção', 'Preencha o nome do hábito!');
      return;
    }
    setSaving(true);
    try {
      await createHabit({ nome, frequencia });
      setModalVisible(false);
      setNome('');
      setFrequencia('diario');
      loadHabits();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível criar o hábito!');
    } finally {
      setSaving(false);
    }
  };

  const handleLog = async (id) => {
    try {
      await logHabit(id, { concluido: true });
      Alert.alert('✅ Hábito marcado!', 'Continue assim!');
      loadHabits();
    } catch (err) {
      console.log('Erro:', err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir hábito', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await deleteHabit(id);
          loadHabits();
        }
      }
    ]);
  };

  const habitIcons = [
    'water-outline', 'barbell-outline', 'moon-outline',
    'book-outline', 'leaf-outline', 'heart-outline',
    'walk-outline', 'nutrition-outline', 'musical-notes-outline',
  ];

  const iconColors = [
    Colors.primary, Colors.accent, Colors.success,
    Colors.warning, Colors.danger, Colors.textMuted,
  ];

  const frequencias = ['diario', 'semanal', 'mensal'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hábitos</Text>
          <Text style={styles.subtitle}>Acompanhe seus hábitos diários</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Resumo */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{habits.length}</Text>
          <Text style={styles.summaryLabel}>Total de hábitos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {habits.filter(h => h.frequencia === 'diario').length}
          </Text>
          <Text style={styles.summaryLabel}>Diários</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>🔥 0</Text>
          <Text style={styles.summaryLabel}>Streak hoje</Text>
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
              <Ionicons name="heart-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum hábito</Text>
              <Text style={styles.emptySubtitle}>Toque no + para adicionar um hábito</Text>
            </View>
          ) : (
            <View style={styles.habitsGrid}>
              {habits.map((habit, i) => (
                <View key={habit.id} style={styles.habitCard}>
                  <View style={[styles.habitIcon, {
                    backgroundColor: iconColors[i % iconColors.length] + '20'
                  }]}>
                    <Ionicons
                      name={habitIcons[i % habitIcons.length]}
                      size={28}
                      color={iconColors[i % iconColors.length]}
                    />
                  </View>
                  <Text style={styles.habitName}>{habit.nome}</Text>
                  <Text style={styles.habitFreq}>{habit.frequencia}</Text>

                  <View style={styles.habitActions}>
                    <TouchableOpacity
                      style={styles.markBtn}
                      onPress={() => handleLog(habit.id)}
                    >
                      <Ionicons name="checkmark" size={16} color={Colors.white} />
                      <Text style={styles.markBtnText}>Marcar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(habit.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo hábito</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nome do hábito *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Beber água, Exercitar..."
              placeholderTextColor={Colors.textMuted}
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>Frequência</Text>
            <View style={styles.freqRow}>
              {frequencias.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.freqBtn, frequencia === f && styles.freqBtnActive]}
                  onPress={() => setFrequencia(f)}
                >
                  <Text style={[styles.freqBtnText, frequencia === f && styles.freqBtnTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Salvar hábito</Text>
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
  },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, marginBottom: 8,
  },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  summaryNumber: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  summaryLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingTop: 12, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
  habitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  habitCard: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: 20,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  habitIcon: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  habitName: {
    fontSize: 14, fontWeight: '600', color: Colors.text,
    textAlign: 'center', marginBottom: 4,
  },
  habitFreq: { fontSize: 11, color: Colors.textMuted, marginBottom: 12 },
  habitActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  markBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  markBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.surfaceLight, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  label: { fontSize: 13, color: Colors.textMuted, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.surfaceLight, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    color: Colors.text, fontSize: 15,
  },
  freqRow: { flexDirection: 'row', gap: 10 },
  freqBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', backgroundColor: Colors.surfaceLight,
  },
  freqBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  freqBtnText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  freqBtnTextActive: { color: Colors.white },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
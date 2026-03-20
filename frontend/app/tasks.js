import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [categoria, setCategoria] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.log('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!titulo) {
      Alert.alert('Atenção', 'Preencha o título da tarefa!');
      return;
    }
    setSaving(true);
    try {
      await createTask({ titulo, prioridade, categoria });
      setModalVisible(false);
      setTitulo('');
      setPrioridade('media');
      setCategoria('');
      loadTasks();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível criar a tarefa!');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task) => {
    const nextStatus = task.status === 'a_fazer'
      ? 'em_andamento'
      : task.status === 'em_andamento'
      ? 'concluido'
      : 'a_fazer';
    try {
      await updateTask(task.id, { status: nextStatus });
      loadTasks();
    } catch (err) {
      console.log('Erro:', err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir tarefa', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await deleteTask(id);
          loadTasks();
        }
      }
    ]);
  };

  const filteredTasks = filter === 'todas'
    ? tasks
    : tasks.filter(t => t.status === filter);

  const prioridades = ['alta', 'media', 'baixa'];

  const priorityConfig = {
    alta: { color: Colors.danger, label: 'Alta' },
    media: { color: Colors.warning, label: 'Média' },
    baixa: { color: Colors.textMuted, label: 'Baixa' },
  };

  const statusConfig = {
    a_fazer: { icon: 'ellipse-outline', color: Colors.textMuted },
    em_andamento: { icon: 'time-outline', color: Colors.primary },
    concluido: { icon: 'checkmark-circle', color: Colors.success },
  };

  const filters = [
    { key: 'todas', label: 'Todas' },
    { key: 'a_fazer', label: 'A fazer' },
    { key: 'em_andamento', label: 'Em progresso' },
    { key: 'concluido', label: 'Concluídas' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tarefas</Text>
          <Text style={styles.subtitle}>Gerencie suas atividades</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhuma tarefa</Text>
              <Text style={styles.emptySubtitle}>Toque no + para adicionar uma tarefa</Text>
            </View>
          ) : (
            filteredTasks.map((task) => {
              const sc = statusConfig[task.status];
              const pc = priorityConfig[task.prioridade];
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => handleToggle(task)}
                >
                  <Ionicons name={sc.icon} size={24} color={sc.color} />
                  <View style={styles.taskContent}>
                    <Text style={[
                      styles.taskTitle,
                      task.status === 'concluido' && styles.taskTitleDone
                    ]}>
                      {task.titulo}
                    </Text>
                    <View style={styles.taskMeta}>
                      {task.categoria ? (
                        <Text style={styles.taskCategory}>{task.categoria}</Text>
                      ) : null}
                      <View style={[styles.priorityBadge, { backgroundColor: pc.color + '20' }]}>
                        <Text style={[styles.priorityText, { color: pc.color }]}>
                          {pc.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(task.id)}>
                    <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal criar tarefa */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova tarefa</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Finalizar proposta"
              placeholderTextColor={Colors.textMuted}
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.label}>Categoria</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Trabalho, Pessoal..."
              placeholderTextColor={Colors.textMuted}
              value={categoria}
              onChangeText={setCategoria}
            />

            <Text style={styles.label}>Prioridade</Text>
            <View style={styles.priorityRow}>
              {prioridades.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    prioridade === p && {
                      backgroundColor: priorityConfig[p].color + '20',
                      borderColor: priorityConfig[p].color,
                    }
                  ]}
                  onPress={() => setPrioridade(p)}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    prioridade === p && { color: priorityConfig[p].color }
                  ]}>
                    {priorityConfig[p].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Salvar tarefa</Text>
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
  filters: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  filterTextActive: { color: Colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  taskCategory: { fontSize: 12, color: Colors.textMuted },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  priorityText: { fontSize: 11, fontWeight: '600' },
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
  priorityRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  priorityOption: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', backgroundColor: Colors.surfaceLight,
  },
  priorityOptionText: { fontSize: 14, fontWeight: '500', color: Colors.textMuted },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
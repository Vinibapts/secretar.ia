import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function TasksScreen() {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [categoria, setCategoria] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('todas');

  useEffect(() => { loadTasks(); }, []);

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
      Alert.alert(t('atencao'), t('preencha_titulo_tarefa'));
      return;
    }
    setSaving(true);
    try {
      await createTask({ titulo, prioridade, categoria });
      setModalVisible(false);
      setTitulo(''); setPrioridade('media'); setCategoria('');
      loadTasks();
    } catch (err) {
      Alert.alert(t('erro'), t('erro_criar_tarefa'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task) => {
    const nextStatus =
      task.status === 'a_fazer' ? 'em_andamento' :
      task.status === 'em_andamento' ? 'concluido' : 'a_fazer';
    try {
      await updateTask(task.id, { status: nextStatus });
      loadTasks();
    } catch (err) {
      console.log('Erro:', err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(t('excluir_tarefa'), t('tem_certeza'), [
      { text: t('cancelar'), style: 'cancel' },
      { text: t('excluir'), style: 'destructive', onPress: async () => { await deleteTask(id); loadTasks(); } }
    ]);
  };

  const filteredTasks = filter === 'todas' ? tasks : tasks.filter(t => t.status === filter);

  const highPriority = filteredTasks.filter(t => t.prioridade === 'alta');
  const medPriority  = filteredTasks.filter(t => t.prioridade === 'media');
  const lowPriority  = filteredTasks.filter(t => t.prioridade === 'baixa');

  const priorityConfig = {
    alta:  { color: Colors.danger,   bg: Colors.dangerLight,  label: t('prioridade_alta')  },
    media: { color: Colors.warning,  bg: Colors.warningLight, label: t('prioridade_media') },
    baixa: { color: Colors.textMuted,bg: Colors.surfaceLight, label: t('prioridade_baixa') },
  };

  const statusConfig = {
    a_fazer:      { icon: 'ellipse-outline',   color: Colors.border   },
    em_andamento: { icon: 'time-outline',       color: Colors.primary  },
    concluido:    { icon: 'checkmark-circle',   color: Colors.success  },
  };

  const filters = [
    { key: 'todas',        label: t('filter_todas')      },
    { key: 'a_fazer',      label: t('filter_a_fazer')    },
    { key: 'em_andamento', label: t('filter_em_progresso') },
    { key: 'concluido',    label: t('filter_concluidas') },
  ];

  const prioridades = ['alta', 'media', 'baixa'];

  const totalPendentes  = tasks.filter(t => t.status !== 'concluido').length;
  const totalConcluidas = tasks.filter(t => t.status === 'concluido').length;

  const renderTask = (task) => {
    const sc = statusConfig[task.status];
    const pc = priorityConfig[task.prioridade];
    return (
      <TouchableOpacity
        key={task.id}
        style={[styles.taskCard, task.status === 'concluido' && styles.taskCardDone]}
        onPress={() => handleToggle(task)}
        activeOpacity={0.7}
      >
        <Ionicons name={sc.icon} size={22} color={sc.color} />
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, task.status === 'concluido' && styles.taskTitleDone]}>
            {task.titulo}
          </Text>
          {task.categoria ? <Text style={styles.taskCategory}>{task.categoria}</Text> : null}
        </View>
        <View style={styles.taskRight}>
          <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
            <Text style={[styles.priorityText, { color: pc.color }]}>{pc.label}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(task.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroup = (title, taskList, dotColor) => {
    if (taskList.length === 0) return null;
    return (
      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <View style={[styles.groupDot, { backgroundColor: dotColor }]} />
          <Text style={styles.groupTitle}>{title}</Text>
          <Text style={styles.groupCount}>{taskList.length}</Text>
        </View>
        {taskList.map(renderTask)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('tarefas')}</Text>
          <Text style={styles.subtitle}>
            {totalPendentes} {t('pendentes')} · {totalConcluidas} {t('concluidas')}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersWrapper}
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
              <View style={styles.emptyIcon}>
                <Ionicons name="checkmark-circle-outline" size={36} color={Colors.success} />
              </View>
              <Text style={styles.emptyTitle}>{t('nenhuma_tarefa')}</Text>
              <Text style={styles.emptySubtitle}>{t('toque_para_adicionar')}</Text>
            </View>
          ) : (
            <>
              {renderGroup(t('grupo_alta'),  highPriority, Colors.danger)}
              {renderGroup(t('grupo_media'), medPriority,  Colors.warning)}
              {renderGroup(t('grupo_baixa'), lowPriority,  Colors.textMuted)}
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('nova_tarefa')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('titulo')} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t('placeholder_tarefa')}
              placeholderTextColor={Colors.textMuted}
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.label}>{t('categoria')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('placeholder_categoria_tarefa')}
              placeholderTextColor={Colors.textMuted}
              value={categoria}
              onChangeText={setCategoria}
            />

            <Text style={styles.label}>{t('prioridade')}</Text>
            <View style={styles.priorityRow}>
              {prioridades.map(p => {
                const pc = priorityConfig[p];
                const active = prioridade === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityOption, active && { backgroundColor: pc.bg, borderColor: pc.color }]}
                    onPress={() => setPrioridade(p)}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: pc.color }]} />
                    <Text style={[styles.priorityOptionText, active && { color: pc.color, fontWeight: '700' }]}>
                      {pc.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
              {saving
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.saveBtnText}>{t('salvar_tarefa')}</Text>
              }
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
    alignItems: 'flex-start', padding: 20, paddingBottom: 14,
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
  filtersWrapper: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filters: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surfaceLight },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  filterTextActive: { color: Colors.white, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.successLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptySubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 6 },
  group: { marginBottom: 20 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  groupCount: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    backgroundColor: Colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 8,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  taskCardDone: { opacity: 0.6 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  taskCategory: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, paddingTop: 12,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, color: Colors.text, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: Colors.text, fontSize: 15 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityOptionText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
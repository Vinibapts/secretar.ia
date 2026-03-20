import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getFinances, createFinance, deleteFinance, getResumo } from '../services/api';

export default function FinancesScreen() {
  const [finances, setFinances] = useState([]);
  const [resumo, setResumo] = useState({ total_receitas: 0, total_gastos: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [financesRes, resumoRes] = await Promise.all([
        getFinances(),
        getResumo(),
      ]);
      setFinances(financesRes.data);
      setResumo(resumoRes.data);
    } catch (err) {
      console.log('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!valor || isNaN(parseFloat(valor))) {
      Alert.alert('Atenção', 'Preencha um valor válido!');
      return;
    }
    setSaving(true);
    try {
      await createFinance({
        valor: parseFloat(valor),
        tipo,
        categoria,
        descricao,
      });
      setModalVisible(false);
      setValor('');
      setTipo('gasto');
      setCategoria('');
      setDescricao('');
      loadData();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Excluir registro', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await deleteFinance(id);
          loadData();
        }
      }
    ]);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short'
    });
  };

  const categoryIcons = {
    alimentacao: 'restaurant-outline',
    transporte: 'car-outline',
    moradia: 'home-outline',
    saude: 'medical-outline',
    lazer: 'game-controller-outline',
    salario: 'cash-outline',
    freelance: 'laptop-outline',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Finanças</Text>
          <Text style={styles.subtitle}>Controle suas receitas e despesas</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Resumo cards */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryReceita]}>
              <Ionicons name="trending-up" size={20} color={Colors.success} />
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                R$ {resumo.total_receitas.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryGasto]}>
              <Ionicons name="trending-down" size={20} color={Colors.danger} />
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                R$ {resumo.total_gastos.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={[styles.saldoCard, {
            borderColor: resumo.saldo >= 0 ? Colors.success : Colors.danger
          }]}>
            <Text style={styles.saldoLabel}>Saldo atual</Text>
            <Text style={[styles.saldoValue, {
              color: resumo.saldo >= 0 ? Colors.success : Colors.danger
            }]}>
              R$ {resumo.saldo.toFixed(2)}
            </Text>
          </View>

          {/* Transações */}
          <Text style={styles.sectionTitle}>Transações recentes</Text>

          {finances.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhuma transação</Text>
              <Text style={styles.emptySubtitle}>Toque no + para registrar um gasto ou receita</Text>
            </View>
          ) : (
            finances.map((f) => (
              <View key={f.id} style={styles.transactionCard}>
                <View style={[styles.transactionIcon, {
                  backgroundColor: f.tipo === 'receita' ? Colors.success + '20' : Colors.danger + '20'
                }]}>
                  <Ionicons
                    name={categoryIcons[f.categoria?.toLowerCase()] || (f.tipo === 'receita' ? 'arrow-up' : 'arrow-down')}
                    size={20}
                    color={f.tipo === 'receita' ? Colors.success : Colors.danger}
                  />
                </View>
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionTitle}>
                    {f.descricao || f.categoria || (f.tipo === 'receita' ? 'Receita' : 'Gasto')}
                  </Text>
                  <Text style={styles.transactionDate}>{formatDate(f.data)}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionValue, {
                    color: f.tipo === 'receita' ? Colors.success : Colors.danger
                  }]}>
                    {f.tipo === 'receita' ? '+' : '-'}R$ {f.valor.toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(f.id)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo registro</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Tipo */}
            <Text style={styles.label}>Tipo *</Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[styles.tipoBtn, tipo === 'gasto' && styles.tipoBtnGasto]}
                onPress={() => setTipo('gasto')}
              >
                <Ionicons name="trending-down" size={18} color={tipo === 'gasto' ? Colors.white : Colors.textMuted} />
                <Text style={[styles.tipoBtnText, tipo === 'gasto' && { color: Colors.white }]}>Gasto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipoBtn, tipo === 'receita' && styles.tipoBtnReceita]}
                onPress={() => setTipo('receita')}
              >
                <Ionicons name="trending-up" size={18} color={tipo === 'receita' ? Colors.white : Colors.textMuted} />
                <Text style={[styles.tipoBtnText, tipo === 'receita' && { color: Colors.white }]}>Receita</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Valor (R$) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={Colors.textMuted}
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Categoria</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Alimentação, Salário..."
              placeholderTextColor={Colors.textMuted}
              value={categoria}
              onChangeText={setCategoria}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Almoço no restaurante"
              placeholderTextColor={Colors.textMuted}
              value={descricao}
              onChangeText={setDescricao}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Salvar</Text>
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  summaryReceita: { borderLeftWidth: 3, borderLeftColor: Colors.success },
  summaryGasto: { borderLeftWidth: 3, borderLeftColor: Colors.danger },
  summaryLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 6 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  saldoCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, marginBottom: 24, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  saldoLabel: { fontSize: 15, color: Colors.textMuted, fontWeight: '500' },
  saldoValue: { fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
  transactionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  transactionIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  transactionContent: { flex: 1 },
  transactionTitle: { fontSize: 14, fontWeight: '500', color: Colors.text },
  transactionDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  transactionRight: { alignItems: 'flex-end', gap: 6 },
  transactionValue: { fontSize: 15, fontWeight: '700' },
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
  tipoRow: { flexDirection: 'row', gap: 10 },
  tipoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceLight,
  },
  tipoBtnGasto: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  tipoBtnReceita: { backgroundColor: Colors.success, borderColor: Colors.success },
  tipoBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
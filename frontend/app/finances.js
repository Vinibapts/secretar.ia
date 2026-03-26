import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
  Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { getFinances, createFinance, deleteFinance, getResumo } from '../services/api';
import { fetchStockData, formatCurrency, formatPercent, getTrendColor, openStockLink } from '../services/stockService';
import { fetchCurrencyData, formatCurrencyValue, formatCurrencyPercent, getCurrencyTrendColor, openCurrencyLink } from '../services/currencyService';
import AnimatedStockScrollSection from '../components/AnimatedStockScrollSection';
import AnimatedCurrencyScrollSection from '../components/AnimatedCurrencyScrollSection';

export default function FinancesScreen() {
  const Colors = useColors();

  const [finances, setFinances] = useState([]);
  const [resumo, setResumo] = useState({ total_receitas: 0, total_gastos: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [financesRes, resumoRes, stocksRes, currenciesRes] = await Promise.all([
        getFinances(),
        getResumo(),
        fetchStockData(),
        fetchCurrencyData(),
      ]);
      setFinances(financesRes.data);
      setResumo(resumoRes.data);
      setStocks(stocksRes);
      setCurrencies(currenciesRes);
    } catch (err) {
      console.log('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStocks = async () => {
    setStocksLoading(true);
    try {
      const stocksRes = await fetchStockData();
      setStocks(stocksRes);
    } catch (err) {
      console.log('Erro ao carregar ações:', err);
    } finally {
      setStocksLoading(false);
    }
  };

  const loadCurrencies = async () => {
    setCurrenciesLoading(true);
    try {
      const currenciesRes = await fetchCurrencyData();
      setCurrencies(currenciesRes);
    } catch (err) {
      console.log('Erro ao carregar moedas:', err);
    } finally {
      setCurrenciesLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!valor || isNaN(parseFloat(valor))) {
      Alert.alert('Atenção', 'Preencha um valor válido!');
      return;
    }
    setSaving(true);
    try {
      await createFinance({ valor: parseFloat(valor), tipo, categoria, descricao });
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
        onPress: async () => { await deleteFinance(id); loadData(); }
      }
    ]);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const getCategoryIcon = (categoria) => {
    const icons = {
      alimentacao: 'restaurant-outline',
      transporte: 'car-outline',
      moradia: 'home-outline',
      saude: 'medical-outline',
      lazer: 'game-controller-outline',
      salario: 'cash-outline',
      freelance: 'laptop-outline',
    };
    return icons[categoria?.toLowerCase()] || 'ellipse-outline';
  };

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
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { padding: 20, paddingBottom: 40 },
    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    summaryCard: {
      flex: 1, backgroundColor: Colors.surface, borderRadius: 18, padding: 16,
      borderTopWidth: 3,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    summaryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    summaryLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
    summaryValue: { fontSize: 18, fontWeight: 'bold' },
    saldoCard: {
      backgroundColor: Colors.surface, borderRadius: 18, padding: 18,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    saldoLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
    saldoValue: { fontSize: 26, fontWeight: 'bold', marginTop: 4 },
    saldoIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    sectionLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyIcon: {
      width: 80, height: 80, borderRadius: 24,
      backgroundColor: Colors.warningLight,
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 6 },
    emptyText: { fontSize: 12, color: Colors.textMuted },
    transactionCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: Colors.surface, borderRadius: 18, padding: 14, marginBottom: 10,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    },
    transactionIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    transactionContent: { flex: 1 },
    transactionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
    transactionDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    transactionRight: { alignItems: 'flex-end', gap: 6 },
    transactionValue: { fontSize: 15, fontWeight: '700' },
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
    tipoRow: { flexDirection: 'row', gap: 10 },
    tipoBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 13, borderRadius: 14,
      borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
    },
    tipoBtnGasto: { backgroundColor: Colors.danger, borderColor: Colors.danger },
    tipoBtnReceita: { backgroundColor: Colors.success, borderColor: Colors.success },
    tipoBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
    saveBtn: {
      backgroundColor: Colors.primary, borderRadius: 14,
      padding: 16, alignItems: 'center', marginTop: 24,
      shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
    stockSection: {
      marginBottom: 24,
    },
    stockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    stockHorizontal: {
      flexDirection: 'row',
      gap: 10,
    },
    stockCard: {
      flex: 1,
      minWidth: 140,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 12,
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    stockName: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.text,
    },
    stockSymbol: {
      fontSize: 10,
      color: Colors.textMuted,
      fontWeight: '500',
    },
    stockPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.text,
      marginBottom: 4,
    },
    stockChange: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    stockChangeValue: {
      fontSize: 12,
      fontWeight: '600',
    },
    stockChangePercent: {
      fontSize: 10,
      fontWeight: '500',
    },
    stockLoading: {
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surfaceLight,
      borderRadius: 16,
    },
    currencySection: {
      marginBottom: 24,
    },
    currencyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    currencyHorizontal: {
      flexDirection: 'row',
      gap: 8,
    },
    currencyCard: {
      flex: 1,
      minWidth: 120,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 10,
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    currencyName: {
      fontSize: 11,
      fontWeight: '600',
      color: Colors.text,
    },
    currencyCode: {
      fontSize: 9,
      color: Colors.textMuted,
      fontWeight: '500',
    },
    currencyRate: {
      fontSize: 14,
      fontWeight: 'bold',
      color: Colors.text,
      marginBottom: 3,
    },
    currencyChange: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    currencyChangeValue: {
      fontSize: 10,
      fontWeight: '600',
    },
    currencyChangePercent: {
      fontSize: 8,
      fontWeight: '500',
    },
    currencyLoading: {
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surfaceLight,
      borderRadius: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderTopColor: Colors.success }]}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="trending-up" size={20} color={Colors.success} />
              </View>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                R$ {resumo.total_receitas.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { borderTopColor: Colors.danger }]}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.dangerLight }]}>
                <Ionicons name="trending-down" size={20} color={Colors.danger} />
              </View>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                R$ {resumo.total_gastos.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.saldoCard}>
            <View>
              <Text style={styles.saldoLabel}>Saldo atual</Text>
              <Text style={[styles.saldoValue, {
                color: resumo.saldo >= 0 ? Colors.success : Colors.danger
              }]}>
                R$ {resumo.saldo.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.saldoIcon, {
              backgroundColor: resumo.saldo >= 0 ? Colors.successLight : Colors.dangerLight
            }]}>
              <Ionicons
                name={resumo.saldo >= 0 ? 'trending-up' : 'trending-down'}
                size={24}
                color={resumo.saldo >= 0 ? Colors.success : Colors.danger}
              />
            </View>
          </View>

          {/* SEÇÃO DE AÇÕES DA BOLSA ANIMADA */}
          <AnimatedStockScrollSection />

          {/* SEÇÃO DE MOEDAS E CÂMBIO ANIMADA */}
          <AnimatedCurrencyScrollSection />

          <Text style={styles.sectionTitle}>Transações recentes</Text>

          {finances.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="wallet-outline" size={40} color={Colors.warning} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma transação</Text>
              <Text style={styles.emptySubtitle}>Toque no + para registrar</Text>
            </View>
          ) : (
            finances.map((f) => (
              <View key={f.id} style={styles.transactionCard}>
                <View style={[styles.transactionIcon, {
                  backgroundColor: f.tipo === 'receita' ? Colors.successLight : Colors.dangerLight
                }]}>
                  <Ionicons
                    name={getCategoryIcon(f.categoria)}
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
                  <Text style={styles.modalTitle}>Novo registro</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

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
                  {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Salvar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../constants/colors';
import { getMeuRanking, getTopRanking } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function RankingScreen() {
  const Colors = useColors();
  const { t } = useTranslation();

  const niveis = [
    { nome: t('nivel_iniciante'), icon: '🗂️', min: 0,    max: 99,    color: Colors.success },
    { nome: t('nivel_aprendiz'), icon: '📋', min: 100,   max: 499,   color: Colors.warning },
    { nome: t('nivel_produtivo'),icon: '📈', min: 500,   max: 1499,  color: Colors.primary },
    { nome: t('nivel_expert'),   icon: '🏆', min: 1500,  max: 3999,  color: Colors.accent  },
    { nome: t('nivel_mestre'),   icon: '👑', min: 4000,  max: 99999, color: '#F59E0B'      },
  ];

  const regras = [
    { acao: t('regra_evento'),   pontos: '+10', icon: 'calendar',           color: Colors.primary, bg: Colors.primaryLight },
    { acao: t('regra_financa'),  pontos: '+5',  icon: 'wallet',             color: Colors.warning, bg: Colors.warningLight },
    { acao: t('regra_chat'),     pontos: '+2',  icon: 'chatbubble-ellipses',color: Colors.accent,  bg: Colors.surfaceLight },
    { acao: t('regra_entrar'),   pontos: '+5',  icon: 'phone-portrait',     color: Colors.primary, bg: Colors.primaryLight },
    { acao: t('regra_streak'),   pontos: '+50', icon: 'flame',              color: '#F59E0B',      bg: Colors.warningLight },
  ];

  const [loading, setLoading] = useState(true);
  const [meuRanking, setMeuRanking] = useState(null);
  const [top10, setTop10] = useState([]);
  const [activeTab, setActiveTab] = useState('ranking');

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const loadData = async () => {
    try {
      const [meuRes, topRes] = await Promise.all([getMeuRanking(), getTopRanking()]);
      setMeuRanking(meuRes.data);
      setTop10(topRes.data);
    } catch (err) {
      console.log('Erro ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNivelConfig = (nomeNivel) =>
    niveis.find(n => n.nome === nomeNivel) || niveis[0];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'flex-start', padding: 20, paddingBottom: 12,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    title: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
    subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
    positionBadge: { backgroundColor: Colors.primaryLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    positionText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
    tabs: {
      flexDirection: 'row', backgroundColor: Colors.surface,
      borderBottomWidth: 1, borderBottomColor: Colors.border,
      paddingHorizontal: 20, gap: 8,
    },
    tab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: Colors.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
    tabTextActive: { color: Colors.primary },
    scroll: { padding: 20, paddingBottom: 40 },
    userCard: {
      backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 24,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 16, elevation: 3,
    },
    userCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarContainer: {
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    avatarText: { fontSize: 22, fontWeight: 'bold', color: Colors.white },
    userInfo: { flex: 1 },
    userName: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
    nivelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    nivelIcon: { fontSize: 14 },
    nivelNome: { fontSize: 13, fontWeight: '600' },
    streakContainer: { alignItems: 'center' },
    streakEmoji: { fontSize: 22 },
    streakNum: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    streakLabel: { fontSize: 11, color: Colors.textMuted },
    pontosRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    pontosCard: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: 14, padding: 12, alignItems: 'center' },
    pontosNum: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
    pontosLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    progressSection: { marginBottom: 14 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
    progressValue: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    progressBar: { height: 8, backgroundColor: Colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4, minWidth: 8 },
    historicoSection: { marginBottom: 14 },
    historicoTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 8 },
    historicoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    historicoMotivo: { fontSize: 12, color: Colors.textMuted, flex: 1 },
    historicoPontos: { fontSize: 12, fontWeight: '700', color: Colors.success },
    warningRow: {
      flexDirection: 'row', gap: 8, alignItems: 'flex-start',
      backgroundColor: Colors.warningLight, borderRadius: 12, padding: 10,
    },
    warningText: { flex: 1, fontSize: 12, color: Colors.warning, fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    rankCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 8,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
    },
    rankCardMe: { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
    rankPosition: { fontSize: 18, width: 32, textAlign: 'center' },
    rankAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
    rankAvatarText: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    rankInfo: { flex: 1 },
    rankName: { fontSize: 14, fontWeight: '600', color: Colors.text },
    rankNivel: { fontSize: 12, color: Colors.textMuted },
    rankPontos: { alignItems: 'flex-end' },
    rankPontosNum: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
    rankPontosLabel: { fontSize: 11, color: Colors.textMuted },
    emptyRanking: { backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 16, marginTop: 8 },
    emptyRankingText: { fontSize: 14, color: Colors.primary, fontWeight: '500', textAlign: 'center' },
    regrasTitulo: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    regraCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 8,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
    },
    regraIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    regraAcao: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text },
    regraPontos: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    regraPontosText: { fontSize: 14, fontWeight: '700' },
    nivelCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 8,
      shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
    },
    nivelCardIcon: { fontSize: 24 },
    nivelCardInfo: { flex: 1 },
    nivelCardNome: { fontSize: 15, fontWeight: '700' },
    nivelCardRange: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    nivelAtualBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    nivelAtualText: { fontSize: 11, fontWeight: '700', color: Colors.white },
    streakRegra: { backgroundColor: Colors.warningLight, borderRadius: 16, padding: 16, marginTop: 16 },
    streakRegraTitle: { fontSize: 15, fontWeight: '700', color: Colors.warning, marginBottom: 8 },
    streakRegraText: { fontSize: 13, color: Colors.warning, lineHeight: 20 },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const nivel = getNivelConfig(meuRanking?.nivel || t('nivel_iniciante'));
  const proximoNivel = niveis.find(n => n.nome === meuRanking?.proximo_nivel);
  const progresso = meuRanking?.progresso_percentual || 0;
  const pontos = meuRanking?.pontos_total || 0;
  const pontosHoje = meuRanking?.pontos_hoje || 0;
  const streak = meuRanking?.streak_dias || 0;
  const posicao = meuRanking?.posicao_ranking || 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('ranking')}</Text>
          <Text style={styles.subtitle}>{t('sua_posicao')}</Text>
        </View>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>#{posicao}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ranking' && styles.tabActive]}
          onPress={() => setActiveTab('ranking')}
        >
          <Text style={[styles.tabText, activeTab === 'ranking' && styles.tabTextActive]}>
            🏆 {t('ranking')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'regras' && styles.tabActive]}
          onPress={() => setActiveTab('regras')}
        >
          <Text style={[styles.tabText, activeTab === 'regras' && styles.tabTextActive]}>
            📋 {t('como_ganhar')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'ranking' ? (
          <>
            <View style={styles.userCard}>
              <View style={styles.userCardTop}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>V</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>Vinícius</Text>
                  <View style={styles.nivelRow}>
                    <Text style={styles.nivelIcon}>{nivel.icon}</Text>
                    <Text style={[styles.nivelNome, { color: nivel.color }]}>{nivel.nome}</Text>
                  </View>
                </View>
                <View style={styles.streakContainer}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.streakNum}>{streak}</Text>
                  <Text style={styles.streakLabel}>{t('dias')}</Text>
                </View>
              </View>

              <View style={styles.pontosRow}>
                <View style={styles.pontosCard}>
                  <Text style={styles.pontosNum}>{pontos}</Text>
                  <Text style={styles.pontosLabel}>{t('pontos_totais')}</Text>
                </View>
                <View style={styles.pontosCard}>
                  <Text style={styles.pontosNum}>{pontosHoje}</Text>
                  <Text style={styles.pontosLabel}>{t('pontos_hoje')}</Text>
                </View>
              </View>

              {proximoNivel && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      {t('proximo_nivel')}: {proximoNivel.icon} {proximoNivel.nome}
                    </Text>
                    <Text style={styles.progressValue}>
                      {pontos}/{meuRanking?.pontos_proximo_nivel} pts
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {
                      width: `${Math.min(progresso, 100)}%`,
                      backgroundColor: nivel.color
                    }]} />
                  </View>
                </View>
              )}

              {meuRanking?.historico_hoje?.length > 0 && (
                <View style={styles.historicoSection}>
                  <Text style={styles.historicoTitle}>{t('acoes_hoje')}</Text>
                  {meuRanking.historico_hoje.slice(0, 3).map((h, i) => (
                    <View key={i} style={styles.historicoRow}>
                      <Text style={styles.historicoMotivo}>{h.motivo}</Text>
                      <Text style={styles.historicoPontos}>+{h.pontos}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.warningRow}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
                <Text style={styles.warningText}>{t('aviso_streak')}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>🏆 {t('top10')}</Text>
            {top10.length === 0 ? (
              <View style={styles.emptyRanking}>
                <Text style={styles.emptyRankingText}>{t('ranking_vazio')}</Text>
              </View>
            ) : (
              top10.map((user, i) => {
                const isMe = user.posicao === posicao;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <View key={user.user_id} style={[styles.rankCard, isMe && styles.rankCardMe]}>
                    <Text style={styles.rankPosition}>
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </Text>
                    <View style={[styles.rankAvatar, isMe && { backgroundColor: Colors.primary }]}>
                      <Text style={[styles.rankAvatarText, isMe && { color: Colors.white }]}>
                        {user.nome[0]}
                      </Text>
                    </View>
                    <View style={styles.rankInfo}>
                      <Text style={[styles.rankName, isMe && { color: Colors.primary }]}>
                        {user.nome} {isMe && `(${t('voce')})`}
                      </Text>
                      <Text style={styles.rankNivel}>{user.nivel}</Text>
                    </View>
                    <View style={styles.rankPontos}>
                      <Text style={[styles.rankPontosNum, isMe && { color: Colors.primary }]}>
                        {user.pontos_total}
                      </Text>
                      <Text style={styles.rankPontosLabel}>pts</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            <Text style={styles.regrasTitulo}>{t('como_ganhar_pontos')}</Text>
            {regras.map((regra, i) => (
              <View key={i} style={styles.regraCard}>
                <View style={[styles.regraIcon, { backgroundColor: regra.bg }]}>
                  <Ionicons name={regra.icon} size={22} color={regra.color} />
                </View>
                <Text style={styles.regraAcao}>{regra.acao}</Text>
                <View style={[styles.regraPontos, { backgroundColor: regra.bg }]}>
                  <Text style={[styles.regraPontosText, { color: regra.color }]}>{regra.pontos}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.regrasTitulo, { marginTop: 24 }]}>{t('niveis')}</Text>
            {niveis.map((n, i) => (
              <View key={i} style={styles.nivelCard}>
                <Text style={styles.nivelCardIcon}>{n.icon}</Text>
                <View style={styles.nivelCardInfo}>
                  <Text style={[styles.nivelCardNome, { color: n.color }]}>{n.nome}</Text>
                  <Text style={styles.nivelCardRange}>{n.min} — {n.max === 99999 ? '∞' : n.max} {t('pontos_label')}</Text>
                </View>
                {meuRanking?.nivel === n.nome && (
                  <View style={[styles.nivelAtualBadge, { backgroundColor: n.color }]}>
                    <Text style={styles.nivelAtualText}>{t('nivel_atual')}</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.streakRegra}>
              <Text style={styles.streakRegraTitle}>⚠️ {t('regra_streak_titulo')}</Text>
              <Text style={styles.streakRegraText}>{t('regra_streak_texto')}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
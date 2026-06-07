import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';
import axios from 'axios';
import { useAuth } from '../../src/features/auth/context/AuthContext';
import { Config } from '../../src/api/config';
import { storage } from '../../src/utils/storage';
import { usePaymentSocket } from '../../src/features/payment/hooks/usePaymentSocket';

export default function ActivationsScreen() {
  const { user } = useAuth();
  const [activations, setActivations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchActivations = useCallback(async (isRefreshing = false) => {
    if (!user?.uid) return;

    if (!isRefreshing && activations.length === 0) {
      const cached = await storage.get(`activations_${user.uid}`);
      if (cached) {
        setActivations(cached);
        setLoading(false);
      }
    }

    if (isRefreshing) setRefreshing(true);
    else if (activations.length === 0) setLoading(true);

    try {
      const response = await axios.get(`${Config.apiUrl}/api/plan-activation/user/${user.uid}`);
      if (response.data.success) {
        const newList = response.data.data || [];
        if (JSON.stringify(newList) !== JSON.stringify(activations)) {
          setActivations(newList);
          await storage.set(`activations_${user.uid}`, newList);
        }
      }
    } catch (err) {
      console.error("❌ [ACTIVATIONS] Error fetching:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, activations]);

  useEffect(() => {
    fetchActivations();
  }, [user?.uid]);

  // Real-time updates
  usePaymentSocket({
    onActivationCreated: () => {
      console.log("🔥 [ACTIVATIONS] Refreshing via Socket...");
      fetchActivations(true);
    }
  });

  const getStats = () => {
    const total = activations.length;
    const active = activations.filter(a => a.statut === 'active' || a.statut === 'activated').length;
    const pending = activations.filter(a => a.statut === 'pending').length;
    const expired = activations.filter(a => a.statut === 'expired').length;
    const totalSpent = activations.reduce((acc, a) => acc + (parseFloat(a.amount) || 0), 0);

    return { total, active, pending, expired, totalSpent };
  };

  const stats = getStats();

  const formatDate = (dateString: string) => {
    if (!dateString) return '...';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
      case 'activated': return 'ACTIVÉ';
      case 'expired': return 'EXPIRÉ';
      default: return 'EN ATTENTE';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'activated': return '#10b981';
      case 'expired': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader 
        title="Mes Activations" 
        amount={`${stats.totalSpent.toLocaleString()} XAF`}
        icon="sync-circle"
        totalStats={{ value: stats.total.toString(), label: "TOTAL" }}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchActivations(true)} />
        }
      >
        {/* Section Aperçu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>APERÇU</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#10b981' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>{stats.active}</Text>
              <Text style={styles.statLabelSmall}>ACTIVÉ</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="hourglass" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>{stats.pending}</Text>
              <Text style={styles.statLabelSmall}>EN ATTENTE</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="close-circle" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>{stats.expired}</Text>
              <Text style={styles.statLabelSmall}>EXPIRÉ</Text>
            </View>
          </View>
        </View>

        {/* Section Historique */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>HISTORIQUE</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => Alert.alert('Bientôt disponible', "Le filtrage sera disponible dans une prochaine mise à jour.")}
          >
            <Ionicons name="funnel-outline" size={14} color="#64748b" />
            <Text style={styles.filterBtnText}>Filtrer</Text>
          </TouchableOpacity>
        </View>

        {loading && activations.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : activations.length > 0 ? (
          <View style={styles.activationsList}>
            {activations.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.activationCard}
                onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.cardStatusIcon, { backgroundColor: getStatusColor(item.statut) }]}>
                    <Ionicons 
                      name={item.statut === 'pending' ? 'hourglass' : (item.statut === 'expired' ? 'close-circle' : 'checkmark-circle')} 
                      size={16} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.cardMainInfo}>
                    <Text style={styles.cardPlanName}>{item.planNetflix || 'Plan Netflix'}</Text>
                    <View style={styles.cardEmailRow}>
                      <Ionicons name="mail-outline" size={12} color="#64748b" />
                      <Text style={styles.cardEmailText}>{item.email || '...'}</Text>
                    </View>
                  </View>
                  <View style={styles.cardValueGroup}>
                    <Text style={styles.cardAmount}>{item.amount} F</Text>
                    <Text style={[styles.cardStatusBadge, { color: getStatusColor(item.statut) }]}>
                      {getStatusLabel(item.statut)}
                    </Text>
                  </View>
                </View>

                {selectedId === item.id && (
                  <View style={styles.cardDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="key-outline" size={14} color="#dc2626" />
                      <Text style={styles.detailLabel}>Mot de passe : </Text>
                      <Text style={styles.detailValue}>{item.motDePasse || '••••••••'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={14} color="#64748b" />
                      <Text style={styles.detailLabel}>Date : </Text>
                      <Text style={styles.detailValue}>{formatDate(item.dateCreation)}</Text>
                    </View>
                    {(item.statut === 'active' || item.statut === 'activated') && (
                      <View style={styles.detailItem}>
                        <Ionicons name="flag-outline" size={14} color="#64748b" />
                        <Text style={styles.detailLabel}>Expire le : </Text>
                        <Text style={[styles.detailValue, { color: '#dc2626', fontWeight: '700' }]}>
                          {formatDate(item.dateExpiration)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="list-outline" size={64} color="#e2e8f0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune activation</Text>
            <Text style={styles.emptySubtitle}>
              L'historique de vos activations de services et comptes apparaîtra ici.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  historyHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterBtnText: {
    fontSize: 12,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValueLarge: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
  },
  statLabelSmall: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  activationsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  activationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardPlanName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  cardEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardEmailText: {
    fontSize: 12,
    color: '#64748b',
  },
  cardValueGroup: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardStatusBadge: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  cardDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  noPlanMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

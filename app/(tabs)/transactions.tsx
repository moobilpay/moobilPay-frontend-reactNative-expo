import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';
import axios from 'axios';
import { useAuth } from '../../src/features/auth/context/AuthContext';
import { Config } from '../../src/api/config';
import { storage } from '../../src/utils/storage';
import { usePaymentSocket } from '../../src/features/payment/hooks/usePaymentSocket';

const { width } = Dimensions.get('window');

const TransactionItem = ({ label, date, amount, status }: any) => {
  const isPositive = amount.toString().startsWith('+');
  const getIcon = () => {
    if (label.toLowerCase().includes('netflix')) return 'play-circle';
    if (label.toLowerCase().includes('spotify')) return 'musical-notes';
    if (label.toLowerCase().includes('disney')) return 'star';
    return isPositive ? 'arrow-up-circle' : 'card';
  };

  const getColor = () => {
    if (label.toLowerCase().includes('netflix')) return '#ef4444';
    if (label.toLowerCase().includes('spotify')) return '#1db954';
    if (label.toLowerCase().includes('disney')) return '#3b82f6';
    return isPositive ? '#10b981' : '#64748b';
  };

  return (
    <View style={styles.transactionRow}>
      <View style={[styles.iconWrapper, { backgroundColor: getColor() }]}>
        <Ionicons name={getIcon() as any} size={20} color="#fff" />
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionLabel}>{label}</Text>
        <Text style={styles.transactionDescription}>{status} • {date}</Text>
      </View>
      <View style={styles.transactionValueGroup}>
        <Text style={[styles.amountText, { color: isPositive ? '#22c55e' : '#1e293b' }]}>
          {isPositive ? '' : '-'}{amount}F
        </Text>
      </View>
    </View>
  );
};

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async (isRefreshing = false) => {
    if (!user?.uid) return;

    if (!isRefreshing && transactions.length === 0) {
      const cached = await storage.get(`transactions_${user.uid}`);
      if (cached) {
        setTransactions(cached.list || []);
        setTotalSpent(cached.totalSpent || 0);
        setLoading(false);
      }
    }

    if (isRefreshing) setRefreshing(true);
    else if (transactions.length === 0) setLoading(true);

    try {
      const response = await axios.get(`${Config.apiUrl}/api/transaction/user/${user.uid}`);
      if (response.data.success) {
        const newList = response.data.data || [];
        const newTotal = response.data.totalSpent || 0;
        
        if (JSON.stringify(newList) !== JSON.stringify(transactions)) {
          setTransactions(newList);
          setTotalSpent(newTotal);
          await storage.set(`transactions_${user.uid}`, { list: newList, totalSpent: newTotal });
        }
      }
    } catch (err) {
      console.error("❌ [TRANSACTIONS] Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [user?.uid]);

  usePaymentSocket({
    onPaymentValidated: () => fetchTransactions(true),
    onActivationCreated: () => fetchTransactions(true)
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '...';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <PageHeader 
        title="Mes Transactions" 
        amount={`${totalSpent.toLocaleString()} F`}
        icon="card"
        totalStats={{ value: transactions.length.toString(), label: "TOTAL" }}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTransactions(true)} />
        }
      >
        {/* Section Aperçu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>APERÇU</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="wallet" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>{totalSpent.toLocaleString()}F</Text>
              <Text style={styles.statLabelSmall}>DÉPENSÉ</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#3b82f6' }]}>
              <Ionicons name="trending-up" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>{transactions.length}</Text>
              <Text style={styles.statLabelSmall}>TRANSAC.</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#10b981' }]}>
              <Ionicons name="leaf" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>2,300F</Text>
              <Text style={styles.statLabelSmall}>ÉCO.</Text>
            </View>
          </View>
        </View>

        {/* Section Récentes */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>RÉCENTES</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => Alert.alert('Bientôt disponible', "Le filtrage sera disponible dans une prochaine mise à jour.")}
          >
            <Ionicons name="funnel-outline" size={14} color="#64748b" />
            <Text style={styles.filterBtnText}>Filtrer</Text>
          </TouchableOpacity>
        </View>

        {loading && transactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        ) : transactions.length > 0 ? (
          <View style={styles.transactionsCard}>
            {transactions.map((item) => (
              <TransactionItem 
                key={item.id}
                label={item.reason || item.planName || 'Paiement'} 
                status={item.status === 'success' ? 'Validé' : 'En attente'}
                date={formatDate(item.dateCreation)} 
                amount={item.amount} 
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
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
  recentHeader: {
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
    elevation: 1,
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
  transactionsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconWrapper: {
    width: 37,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
    marginLeft: 14,
  },
  transactionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionValueGroup: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
});

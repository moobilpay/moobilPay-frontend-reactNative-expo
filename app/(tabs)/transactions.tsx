import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';

const { width } = Dimensions.get('window');

const TransactionItem = ({ label, date, amount, icon, color, description }: any) => (
  <View style={styles.transactionRow}>
    <View style={[styles.iconWrapper, { backgroundColor: color }]}>
      <Ionicons name={icon} size={20} color="#fff" />
    </View>
    <View style={styles.transactionContent}>
      <Text style={styles.transactionLabel}>{label}</Text>
      <Text style={styles.transactionDescription}>{description} • {date}</Text>
    </View>
    <View style={styles.transactionValueGroup}>
      <Text style={[styles.amountText, { color: amount.startsWith('+') ? '#22c55e' : '#1e293b' }]}>
        {amount}
      </Text>
    </View>
  </View>
);

export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <PageHeader 
        title="Mes Transactions" 
        amount="12,500F"
        icon="card" 
        variant="premium"
        totalStats={{ value: "8", label: "TOTAL" }}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              <Text style={styles.statValueLarge}>12,500F</Text>
              <Text style={styles.statLabelSmall}>DÉPENSÉ</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#3b82f6' }]}>
              <Ionicons name="trending-up" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>8</Text>
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
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="funnel-outline" size={14} color="#64748b" />
            <Text style={styles.filterBtnText}>Filtrer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsCard}>
          <TransactionItem 
            label="Netflix Premium" 
            description="Abonnement mensuel"
            date="15 Jan 2024" 
            amount="-2,000F" 
            icon="play-circle" 
            color="#ef4444" 
          />
          <TransactionItem 
            label="Spotify Premium" 
            description="Abonnement mensuel"
            date="12 Jan 2024" 
            amount="-800F" 
            icon="musical-notes" 
            color="#3b82f6" 
          />
          <TransactionItem 
            label="Disney+ Premium" 
            description="Abonnement mensuel"
            date="10 Jan 2024" 
            amount="-1,500F" 
            icon="star" 
            color="#f59e0b" 
          />
          <TransactionItem 
            label="Remboursement" 
            description="Annulation service"
            date="08 Jan 2024" 
            amount="+1,200F" 
            icon="arrow-up-circle" 
            color="#10b981" 
          />
        </View>
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
});

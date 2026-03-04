import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';

export default function ActivationsScreen() {
  return (
    <View style={styles.container}>
      <PageHeader 
        title="Mes Activations" 
        amount="0 XAF"
        icon="sync-circle" 
        variant="premium"
        totalStats={{ value: "0", label: "TOTAL" }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <Text style={styles.statValueLarge}>0</Text>
              <Text style={styles.statLabelSmall}>ACTIVÉ</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="hourglass" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>0</Text>
              <Text style={styles.statLabelSmall}>EN ATTENTE</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="close-circle" size={18} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValueLarge}>0</Text>
              <Text style={styles.statLabelSmall}>EXPIRÉ</Text>
            </View>
          </View>
        </View>

        {/* Section Historique */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>HISTORIQUE</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="funnel-outline" size={14} color="#64748b" />
            <Text style={styles.filterBtnText}>Filtrer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="list-outline" size={64} color="#e2e8f0" />
          </View>
          <Text style={styles.emptyTitle}>Aucune activation</Text>
          <Text style={styles.emptySubtitle}>
            L'historique de vos activations de services et comptes apparaîtra ici.
          </Text>
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
});

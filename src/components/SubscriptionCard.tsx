import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * SubscriptionCard — version EMPILÉE (non-slider) de la carte de suivi.
 *
 * Utilisée uniquement en mode review Apple sur le home : affiche le nom de
 * l'abonnement, les jours restants et la progression — SANS aucun prix
 * (Guideline 3.1.1). C'est un pur affichage de suivi d'abonnement.
 */

export interface SubscriptionStats {
  name: string;
  daysLeft: number;
  progress: number; // 0-100 (temps restant)
}

export function getSubscriptionStats(plan: any): SubscriptionStats {
  if (!plan) return { name: 'Suivi', daysLeft: 0, progress: 0 };

  const now = new Date();
  const expiry = new Date(plan.dateExpiration);
  const start = new Date(plan.dateDebut || plan.dateCreation);

  // Garde anti-NaN : si les dates sont absentes/invalides, on retombe sur la
  // durée par défaut (29 j) à partir de maintenant.
  const expiryMs = isNaN(expiry.getTime())
    ? now.getTime() + (plan.dureeActivation || 29) * 24 * 60 * 60 * 1000
    : expiry.getTime();
  const startMs = isNaN(start.getTime()) ? now.getTime() : start.getTime();

  const diffTime = expiryMs - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const totalTime = expiryMs - startMs;
  const elapsed = now.getTime() - startMs;
  let progress = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;
  progress = Math.min(100, Math.max(0, progress));

  return {
    // En review on affiche le nom saisi par l'utilisateur (stocké dans planNetflix),
    // sinon un libellé neutre.
    name: plan.planNetflix || 'Suivi',
    daysLeft,
    progress: 100 - progress,
  };
}

interface Props {
  plan: any;
}

const SubscriptionCard: React.FC<Props> = ({ plan }) => {
  const stats = getSubscriptionStats(plan);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.nameWrap}>
          <View style={styles.iconBox}>
            <Ionicons name="repeat" size={16} color="#dc2626" />
          </View>
          <Text style={styles.name} numberOfLines={1}>{stats.name}</Text>
        </View>
        <View style={styles.daysBadge}>
          <Text style={styles.daysNumber}>{stats.daysLeft}</Text>
          <Text style={styles.daysLabel}>jours</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#dc2626', '#ef4444', '#f87171']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${stats.progress}%` }]}
          />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomLabel}>Temps restant</Text>
        <Text style={styles.bottomValue}>{stats.daysLeft} jour(s)</Text>
      </View>
    </View>
  );
};

export default SubscriptionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  daysBadge: {
    alignItems: 'center',
    marginLeft: 12,
  },
  daysNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ef4444',
    lineHeight: 26,
  },
  daysLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  bottomValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
});

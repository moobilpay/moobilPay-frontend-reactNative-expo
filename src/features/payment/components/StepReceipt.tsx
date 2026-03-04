/**
 * StepReceipt.tsx  (Page 6 - Success)
 * 
 * Final screen shown after 'activationcreated' socket event fires.
 * Shows:
 *  - Success animation/icon
 *  - Plan name + validity date
 *  - Support contact info
 *  - Actions: "Suivi" (→ activations tab) | "Accueil" (→ home)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NetflixPlan } from '../types';

interface Props {
  selectedPlan: NetflixPlan | undefined;
  netflixEmail: string;
  transactionId: string;
  onGoToActivations: () => void;
  onGoHome: () => void;
}

export default function StepReceipt({
  selectedPlan,
  netflixEmail,
  transactionId,
  onGoToActivations,
  onGoHome,
}: Props) {
  const getEndDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Success animation circle */}
      <View style={styles.successWrapper}>
        <LinearGradient
          colors={['#22c55e', '#16a34a']}
          style={styles.successCircle}
        >
          <Ionicons name="checkmark-circle" size={52} color="#fff" />
        </LinearGradient>
        <View style={styles.successGlow} />
      </View>

      {/* <Text style={styles.title}>🎉 Paiement réussi !</Text> */}
      <Text style={styles.subtitle}>
        Après 1h, si votre compte n'est pas activé, veuillez contacter le service client au{'\n'}
        <Text style={styles.phone}>696 08 00 87 / 698 17 89 25</Text>
      </Text>

      {/* Activation badge */}
      <View style={styles.activationBadge}>
        <Ionicons name="sync-circle" size={18} color="#22c55e" />
        <Text style={styles.activationText}>Activation du compte en cours</Text>
      </View>

      {/* Details card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Récapitulatif</Text>

        <View style={styles.detailRow}>
          <Ionicons name="tv-outline" size={16} color="#64748b" />
          <Text style={styles.detailLabel}>Plan</Text>
          <Text style={styles.detailValue}>{selectedPlan?.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text style={styles.detailLabel}>Valide jusqu'au</Text>
          <Text style={styles.detailValue}>{getEndDate()}</Text>
        </View>

        {netflixEmail ? (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={[styles.detailValue, styles.emailValue]}>{netflixEmail}</Text>
          </View>
        ) : null}

        {transactionId ? (
          <View style={styles.detailRow}>
            <Ionicons name="receipt-outline" size={16} color="#64748b" />
            <Text style={styles.detailLabel}>Transaction</Text>
            <Text style={styles.detailValue}>#{transactionId.slice(-8).toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.activationsBtn} onPress={onGoToActivations}>
          <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.actionBtnGradient}>
            <Ionicons name="list-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Suivi</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={onGoHome}>
          <View style={styles.homeBtnInner}>
            <Ionicons name="home" size={18} color="#1e293b" />
            <Text style={styles.homeBtnText}>Accueil</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 30,
    paddingBottom: 60,
    gap: 20,
  },
  successWrapper: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
  },
  successCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 2,
  },
  successGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(34,197,94,0.12)',
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  phone: {
    fontWeight: '700',
    color: '#dc2626',
  },
  activationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  activationText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    maxWidth: '55%',
    textAlign: 'right',
  },
  emailValue: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  activationsBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  homeBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  homeBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
  },
  homeBtnText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '700',
  },
});

/**
 * StepProcessing.tsx  (Page 5)
 * 
 * Arrived here after:
 *  - Mobile Money: payment link webview was opened AND socket 'payment_validated' fires
 *  - Card: card submission successful
 *  - PayPal: redirect confirmation
 * 
 * We now wait for the backend to fully create the activation,
 * which fires socket 'activationcreated', then we move to page 6.
 * 
 * verificationStep:
 *   1 → Payment accepted, waiting for activation
 *   2 → Activation in progress
 *   3 → Done (transitioning to receipt)
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  verificationStep: number;
}

const STEPS = [
  { label: 'Paiement validé', icon: 'checkmark-circle' as const },
  { label: 'Activation en cours', icon: 'rocket' as const },
  { label: 'Abonnement en attente', icon: 'sync-circle' as const },
];

export default function StepProcessing({ verificationStep }: Props) {
  return (
    <View style={styles.container}>
      {/* Central spinner */}
      <View style={styles.spinnerWrapper}>
        <View style={styles.spinnerOuter}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
        <View style={styles.spinnerGlow} />
      </View>

      <Text style={styles.title}>Activation en cours !</Text>
      <Text style={styles.subtitle}>
        Votre abonnement est en cours de création. Veuillez patienter quelques instants.
      </Text>

      {/* Processing steps */}
      <View style={styles.stepsWrapper}>
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isDone = verificationStep > stepNum;
          const isActive = verificationStep === stepNum;
          return (
            <View key={i} style={styles.processStep}>
              <View style={[
                styles.stepIcon,
                isDone && styles.stepIconDone,
                isActive && styles.stepIconActive,
              ]}>
                {isDone ? (
                  <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                ) : isActive ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <Ionicons name={step.icon} size={22} color="#cbd5e1" />
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                isDone && styles.stepLabelDone,
                isActive && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Security badge */}
      <View style={styles.securityBadge}>
        <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
        <Text style={styles.securityText}>Transaction sécurisée</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 20,
  },
  spinnerWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  spinnerGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220,38,38,0.08)',
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsWrapper: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  stepIconActive: {
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  stepLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  stepLabelDone: {
    color: '#22c55e',
  },
  stepLabelActive: {
    color: '#dc2626',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  securityText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
  },
});

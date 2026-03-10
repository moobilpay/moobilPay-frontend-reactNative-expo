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
import { NetflixPlan, PaymentMethod } from '../types';
import { sharedStyles } from '../styles/shared';

interface MethodOption {
  id: PaymentMethod;
  label: string;
  subtitle: string;
  iconName: any;
  iconColor: string;
  iconBg: string;
}

const METHODS: MethodOption[] = [
  {
    id: 'orangemoney',
    label: 'Orange Money',
    subtitle: 'Paiement mobile rapide et sécurisé',
    iconName: 'phone-portrait-outline',
    iconColor: '#ff6600',
    iconBg: 'rgba(255,102,0,0.12)',
  },
  {
    id: 'mtnmoney',
    label: 'MTN Mobile Money',
    subtitle: 'Paiement mobile rapide et sécurisé',
    iconName: 'phone-portrait-outline',
    iconColor: '#e6ac00',
    iconBg: 'rgba(230,172,0,0.12)',
  },
  {
    id: 'card',
    label: 'Carte bancaire',
    subtitle: 'Visa, Mastercard, CB',
    iconName: 'card-outline',
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.12)',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    subtitle: 'Paiement sécurisé en ligne',
    iconName: 'logo-paypal',
    iconColor: '#003087',
    iconBg: 'rgba(0,48,135,0.10)',
  },
];

interface Props {
  selectedPlan: NetflixPlan | undefined;
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (m: PaymentMethod) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepPaymentMethod({
  selectedPlan,
  selectedMethod,
  onSelectMethod,
  onContinue,
  onBack,
}: Props) {
  return (
    <ScrollView contentContainerStyle={sharedStyles.stepContent} showsVerticalScrollIndicator={false}>
      {/* Plan mini-summary */}
      <View style={sharedStyles.summaryCard}>
        <View style={sharedStyles.summaryHeader}>
          <View style={sharedStyles.summaryBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
            <Text style={sharedStyles.summaryBadgeText}>SÉLECTIONNÉ</Text>
          </View>
          <Text style={sharedStyles.summaryPrice}>
            {selectedPlan?.price?.toLocaleString()} {selectedPlan?.currency}
          </Text>
        </View>
        <Text style={sharedStyles.summaryPlanName}>{selectedPlan?.name}</Text>
        <Text style={sharedStyles.summarySubtitle}>Facturation mensuelle</Text>
      </View>

      {/* Method list */}
      <View style={styles.methodsGrid}>
        {METHODS.map((m) => {
          const isSelected = selectedMethod === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, isSelected && styles.methodCardSelected]}
              onPress={() => onSelectMethod(m.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.methodIconBox, { backgroundColor: m.iconBg }]}>
                  <Ionicons name={m.iconName} size={26} color={m.iconColor} />
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>
              <View style={styles.methodTextBlock}>
                <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]} numberOfLines={1}>
                  {m.label}
                </Text>
                <Text style={styles.methodSubtitle} numberOfLines={2}>{m.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Buttons */}
      <View style={sharedStyles.btnsRow}>
        <TouchableOpacity style={sharedStyles.backBtn} onPress={onBack}>
          <Text style={sharedStyles.backBtnText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sharedStyles.nextBtn, !selectedMethod && sharedStyles.btnDisabled]}
          onPress={selectedMethod ? onContinue : undefined}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#ef4444', '#dc2626']} style={sharedStyles.gradientBtn}>
            <Text style={sharedStyles.btnText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  methodCard: {
    width: '48%', // 2 colonnes dans la grille
    padding: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  methodCardSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fff',
    shadowColor: '#dc2626',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextBlock: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  methodLabelSelected: {
    color: '#dc2626',
  },
  methodSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#dc2626',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dc2626',
  },
});

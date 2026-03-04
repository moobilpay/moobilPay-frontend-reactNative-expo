import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NetflixPlan } from '../types';
import { sharedStyles } from '../styles/shared';

interface Props {
  selectedPlan: NetflixPlan | undefined;
  userFirstName: string;
  userLastName: string;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onContinue: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function StepNetflixInfo({
  selectedPlan,
  userFirstName,
  userLastName,
  onFirstNameChange,
  onLastNameChange,
  onContinue,
  onBack,
  loading,
}: Props) {
  const canContinue = userFirstName.trim().length > 0 && userLastName.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={sharedStyles.stepContent} showsVerticalScrollIndicator={false}>
      {/* Plan summary */}
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
        <View style={styles.planFeatureRow}>
          <View style={styles.featurePill}>
            <Ionicons name="tv" size={12} color="#64748b" />
            <Text style={styles.featureText}>{selectedPlan?.resolution}</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="people" size={12} color="#64748b" />
            <Text style={styles.featureText}>{selectedPlan?.simultaneous} écran(s)</Text>
          </View>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Informations personnelles</Text>
        <Text style={styles.formSubtitle}>
          Nous créerons votre compte Netflix automatiquement
        </Text>

        <View style={sharedStyles.inputGroup}>
          <Text style={sharedStyles.label}>Prénom</Text>
          <View style={sharedStyles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#94a3b8" />
            <TextInput
              style={sharedStyles.input}
              placeholder="Votre prénom"
              placeholderTextColor="#94a3b8"
              value={userFirstName}
              onChangeText={onFirstNameChange}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={sharedStyles.inputGroup}>
          <Text style={sharedStyles.label}>Nom</Text>
          <View style={sharedStyles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#94a3b8" />
            <TextInput
              style={sharedStyles.input}
              placeholder="Votre nom de famille"
              placeholderTextColor="#94a3b8"
              value={userLastName}
              onChangeText={onLastNameChange}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={sharedStyles.hintBox}>
          <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
          <Text style={sharedStyles.hintText}>
            Ces informations serviront à créer votre compte Netflix @moobilpay.com
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={sharedStyles.btnsRow}>
        <TouchableOpacity style={sharedStyles.backBtn} onPress={onBack}>
          <Text style={sharedStyles.backBtnText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sharedStyles.nextBtn, (!canContinue || loading) && sharedStyles.btnDisabled]}
          onPress={canContinue && !loading ? onContinue : undefined}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#ef4444', '#dc2626']} style={sharedStyles.gradientBtn}>
            {loading ? (
              <Text style={sharedStyles.btnText}>Vérification...</Text>
            ) : (
              <>
                <Text style={sharedStyles.btnText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  planFeatureRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
  },
});

/**
 * StepPaymentDetails.tsx — Étape 4 : Formulaire de détails de paiement
 *
 * Ce composant gère les FORMULAIRES dans l'app. Le modal WebView de paiement
 * (bottom sheet) est géré par PaymentBottomSheet.tsx dans pay.tsx.
 *
 * • Mobile Money (Orange/MTN) : Formulaire téléphone +237
 *   → Clic "Payer" appelle onSubmit() → pay.tsx ouvre le bottom sheet
 * • Carte bancaire : Formulaire 2 étapes (numéro+nom → expiry+CVV)
 * • PayPal : Info + bouton redirect
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NetflixPlan, PaymentMethod } from '../types';
import { sharedStyles } from '../styles/shared';

interface Props {
  selectedPlan: NetflixPlan | undefined;
  selectedMethod: PaymentMethod;
  // Mobile money
  phoneNumber: string;
  onPhoneChange: (v: string) => void;
  // Card
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  onCardNumberChange: (v: string) => void;
  onCardNameChange: (v: string) => void;
  onExpiryChange: (v: string) => void;
  onCvvChange: (v: string) => void;
  // Actions
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function StepPaymentDetails({
  selectedPlan,
  selectedMethod,
  phoneNumber,
  onPhoneChange,
  cardNumber,
  cardName,
  expiryDate,
  cvv,
  onCardNumberChange,
  onCardNameChange,
  onExpiryChange,
  onCvvChange,
  onSubmit,
  onBack,
  isLoading,
}: Props) {
  const [cardStep, setCardStep] = useState<1 | 2>(1);
  const [saveCard, setSaveCard] = useState(false);

  const isMobileMoney = selectedMethod === 'orangemoney' || selectedMethod === 'mtnmoney';
  const isOrange = selectedMethod === 'orangemoney';

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').substring(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').substring(0, 4);
    if (digits.length > 2) return digits.substring(0, 2) + '/' + digits.substring(2);
    return digits;
  };

  const canSubmitMobile = phoneNumber.replace(/\s/g, '').length >= 9;
  const canSubmitCard1 = cardNumber.replace(/\s/g, '').length === 16 && cardName.trim().length > 0;
  const canSubmitCard2 = expiryDate.length === 5 && cvv.length >= 3;

  // ─── Plan summary mini ────────────────────────────────────────────────────
  const PlanSummary = () => (
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
  );

  // ─── Mobile Money ─────────────────────────────────────────────────────────
  const renderMobileMoneyForm = () => (
    <View>
      {/* Carte visuelle simulée */}
      <View style={styles.virtualCard}>
        <LinearGradient
          colors={isOrange ? ['#ff6600', '#e65c00'] : ['#e6ac00', '#c49600']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.virtualCardGradient}
        >
          <View style={styles.virtualCardTop}>
            <View style={styles.cardChip} />
            <Text style={styles.cardOperatorLabel}>
              {isOrange ? 'Orange Money' : 'MTN MoMo'}
            </Text>
          </View>
          <Text style={styles.cardPhonePreview}>
            +237 {phoneNumber || '6XX XXX XXX'}
          </Text>
          <View style={styles.virtualCardBottom}>
            <Text style={styles.cardAssocLabel}>Numéro associé</Text>
            <Text style={styles.cardCountryLabel}>Cameroun 🇨🇲</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Champ téléphone */}
      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.label}>Numéro de téléphone</Text>
        <View style={sharedStyles.inputWrapper}>
          <View style={styles.prefixBadge}>
            <Text style={styles.prefixText}>+237</Text>
          </View>
          <TextInput
            style={[sharedStyles.input, { marginLeft: 4 }]}
            placeholder="6XX XXX XXX"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={onPhoneChange}
            maxLength={9}
          />
        </View>
        <View style={sharedStyles.hintBox}>
          <Ionicons name="information-circle-outline" size={16} color="#3b82f6" />
          <Text style={sharedStyles.hintText}>
            Entrez le numéro associé à votre compte{' '}
            {isOrange ? 'Orange Money' : 'MTN Mobile Money'}
          </Text>
        </View>
      </View>

      {/* Info code USSD */}
      <View style={styles.ussdInfoBox}>
        <View style={styles.ussdInfoRow}>
          <Ionicons name="call-outline" size={18} color="#64748b" />
          <Text style={styles.ussdInfoText}>
            Code USSD :{' '}
            <Text style={styles.ussdCode}>{isOrange ? '#150#' : '*126#'}</Text>
          </Text>
        </View>
        <Text style={styles.ussdInfoSubtext}>
          Une notification push vous sera envoyée pour valider le paiement.
        </Text>
      </View>

      <View style={sharedStyles.btnsRow}>
        <TouchableOpacity style={sharedStyles.backBtn} onPress={onBack}>
          <Text style={sharedStyles.backBtnText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sharedStyles.nextBtn, (!canSubmitMobile || isLoading) && sharedStyles.btnDisabled]}
          onPress={canSubmitMobile && !isLoading ? onSubmit : undefined}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#ef4444', '#dc2626']} style={sharedStyles.gradientBtn}>
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={sharedStyles.btnText}>Initialisation...</Text>
              </>
            ) : (
              <>
                <Text style={sharedStyles.btnText}>
                  Payer {selectedPlan?.price?.toLocaleString()} {selectedPlan?.currency}
                </Text>
                <Ionicons name="lock-closed" size={16} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Carte bancaire ───────────────────────────────────────────────────────
  const renderCardForm = () => (
    <View>
      {/* Carte preview */}
      <View style={styles.virtualCard}>
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.virtualCardGradient}
        >
          <View style={styles.virtualCardTop}>
            <View style={styles.cardChip} />
            <Ionicons name="wifi-outline" size={22} color="rgba(255,255,255,0.7)" />
          </View>
          <Text style={styles.cardNumberPreview}>{cardNumber || '•••• •••• •••• ••••'}</Text>
          <View style={styles.virtualCardBottom}>
            <View>
              <Text style={styles.cardAssocLabel}>NOM DU TITULAIRE</Text>
              <Text style={styles.cardCountryLabel}>{cardName || 'Votre Nom'}</Text>
            </View>
            <View>
              <Text style={styles.cardAssocLabel}>EXPIRE</Text>
              <Text style={styles.cardCountryLabel}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {cardStep === 1 ? (
        <>
          <View style={sharedStyles.inputGroup}>
            <Text style={sharedStyles.label}>Numéro de carte</Text>
            <View style={sharedStyles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#94a3b8" />
              <TextInput
                style={sharedStyles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={(t) => onCardNumberChange(formatCardNumber(t))}
                maxLength={19}
              />
            </View>
          </View>
          <View style={sharedStyles.inputGroup}>
            <Text style={sharedStyles.label}>Nom du titulaire</Text>
            <View style={sharedStyles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#94a3b8" />
              <TextInput
                style={sharedStyles.input}
                placeholder="Prénom Nom"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                value={cardName}
                onChangeText={onCardNameChange}
              />
            </View>
          </View>
          <View style={sharedStyles.btnsRow}>
            <TouchableOpacity style={sharedStyles.backBtn} onPress={onBack}>
              <Text style={sharedStyles.backBtnText}>Retour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sharedStyles.nextBtn, !canSubmitCard1 && sharedStyles.btnDisabled]}
              onPress={canSubmitCard1 ? () => setCardStep(2) : undefined}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#ef4444', '#dc2626']} style={sharedStyles.gradientBtn}>
                <Text style={sharedStyles.btnText}>Suivant</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.cardRow}>
            <View style={[sharedStyles.inputGroup, { flex: 1 }]}>
              <Text style={sharedStyles.label}>Date d'expiration</Text>
              <View style={sharedStyles.inputWrapper}>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={expiryDate}
                  onChangeText={(t) => onExpiryChange(formatExpiry(t))}
                  maxLength={5}
                />
              </View>
            </View>
            <View style={[sharedStyles.inputGroup, { flex: 1 }]}>
              <Text style={sharedStyles.label}>CVV</Text>
              <View style={sharedStyles.inputWrapper}>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="123"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  secureTextEntry
                  value={cvv}
                  onChangeText={onCvvChange}
                  maxLength={4}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.saveCardRow} onPress={() => setSaveCard(!saveCard)}>
            <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
              {saveCard && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.saveCardText}>Enregistrer cette carte pour mes prochains achats</Text>
          </TouchableOpacity>
          <View style={sharedStyles.btnsRow}>
            <TouchableOpacity style={sharedStyles.backBtn} onPress={() => setCardStep(1)}>
              <Text style={sharedStyles.backBtnText}>Retour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sharedStyles.nextBtn, (!canSubmitCard2 || isLoading) && sharedStyles.btnDisabled]}
              onPress={canSubmitCard2 && !isLoading ? onSubmit : undefined}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#ef4444', '#dc2626']} style={sharedStyles.gradientBtn}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={sharedStyles.btnText}>
                      Payer {selectedPlan?.price?.toLocaleString()} {selectedPlan?.currency}
                    </Text>
                    <Ionicons name="lock-closed" size={16} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  // ─── PayPal ───────────────────────────────────────────────────────────────
  const renderPayPalForm = () => (
    <View>
      <View style={styles.virtualCard}>
        <LinearGradient colors={['#003087', '#0070ba']} style={styles.virtualCardGradient}>
          <View style={styles.virtualCardTop}>
            <View style={styles.cardChip} />
            <Ionicons name="logo-paypal" size={28} color="#fff" />
          </View>
          <Text style={styles.cardPhonePreview}>Paiement sécurisé</Text>
          <View style={styles.virtualCardBottom}>
            <Text style={styles.cardAssocLabel}>Compte PayPal</Text>
            <Text style={styles.cardCountryLabel}>Protection acheteur</Text>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.paypalInfoBox}>
        <Ionicons name="information-circle" size={22} color="#003087" />
        <Text style={styles.paypalInfoText}>
          Vous serez redirigé vers PayPal pour finaliser votre paiement de manière sécurisée.
        </Text>
      </View>
      <View style={sharedStyles.btnsRow}>
        <TouchableOpacity style={sharedStyles.backBtn} onPress={onBack}>
          <Text style={sharedStyles.backBtnText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sharedStyles.nextBtn, isLoading && sharedStyles.btnDisabled]}
          onPress={!isLoading ? onSubmit : undefined}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#003087', '#0070ba']} style={sharedStyles.gradientBtn}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={sharedStyles.btnText}>
                  Payer avec PayPal {selectedPlan?.price?.toLocaleString()} {selectedPlan?.currency}
                </Text>
                <Ionicons name="logo-paypal" size={16} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render principal ─────────────────────────────────────────────────────
  return (
    <ScrollView
      contentContainerStyle={sharedStyles.stepContent}
      showsVerticalScrollIndicator={false}
    >
      <PlanSummary />
      {isMobileMoney && renderMobileMoneyForm()}
      {selectedMethod === 'card' && renderCardForm()}
      {selectedMethod === 'paypal' && renderPayPalForm()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  virtualCard: {
    height: 190,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  virtualCardGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  virtualCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 44,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
  },
  cardOperatorLabel: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cardPhonePreview: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  cardNumberPreview: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: 2 },
  virtualCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardAssocLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardCountryLabel: { fontSize: 13, color: '#fff', fontWeight: '700', marginTop: 2 },
  // Préfixe téléphone
  prefixBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 4,
  },
  prefixText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  // USSD
  ussdInfoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ussdInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ussdInfoText: { fontSize: 14, color: '#475569' },
  ussdCode: { fontWeight: '800', color: '#dc2626', fontSize: 15 },
  ussdInfoSubtext: { fontSize: 12, color: '#94a3b8', lineHeight: 18 },
  // Carte
  cardRow: { flexDirection: 'row', gap: 12 },
  saveCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#cbd5e1',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  saveCardText: { flex: 1, fontSize: 13, color: '#475569' },
  // PayPal
  paypalInfoBox: {
    flexDirection: 'row', backgroundColor: '#eff6ff',
    padding: 16, borderRadius: 14, gap: 12, marginBottom: 8, alignItems: 'flex-start',
  },
  paypalInfoText: { flex: 1, fontSize: 13, color: '#1e3a5f', lineHeight: 20 },
});

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Config } from '../api/config';
import { useAuth } from '../features/auth/context/AuthContext';

/**
 * AddSubscriptionSheet — bottom sheet d'ajout d'un abonnement à suivre.
 *
 * Remplace l'écran /pay en mode review Apple : l'utilisateur saisit
 * UNIQUEMENT le nom de son abonnement (aucun prix, aucune date — la durée
 * suit la logique par défaut du backend, le montant est envoyé par défaut et
 * jamais affiché). L'abonnement est réellement enregistré (vrai tracker).
 */

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void; // callback pour rafraîchir la liste après ajout
}

// Montant par défaut envoyé au backend (jamais affiché à l'utilisateur en review).
// Doit être non-nul : le backend rejette amount falsy (validation init-mobile-money).
const DEFAULT_AMOUNT = 1;

const AddSubscriptionSheet: React.FC<Props> = ({ visible, onClose, onAdded }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Nom requis', "Saisissez le nom du suivi à ajouter.");
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await user?.getIdToken();
      // En mode review, le backend (APPLE_REVIEW_MODE) crée directement
      // l'activation "active" sans aucun paiement réel. On stocke le nom saisi
      // dans typeDePlan → enregistré dans planNetflix → affiché tel quel.
      await axios.post(
        `${Config.apiUrl}/api/payment/init-mobile-money`,
        {
          numeroOM: 'N/A',
          phone: 'N/A',
          email: user?.email || 'review@moobilpay.com',
          motDePasse: 'N/A',
          typeDePlan: trimmed,
          userId: user?.uid,
          amount: DEFAULT_AMOUNT,
        },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      reset();
      onAdded();
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert(
        'Erreur',
        err?.response?.data?.message || err?.message || "Impossible d'ajouter le suivi. Réessayez."
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="add-circle" size={26} color="#dc2626" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Ajouter un suivi</Text>
              <Text style={styles.subtitle}>Suivez un nouvel élément</Text>
            </View>
          </View>

          <Text style={styles.label}>Nom du suivi</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="bookmark-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex : Mon suivi mensuel"
              placeholderTextColor="#cbd5e1"
              autoFocus
              editable={!submitting}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!name.trim() || submitting) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim() || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Ajouter</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddSubscriptionSheet;

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 24,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    height: 54,
    borderRadius: 14,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

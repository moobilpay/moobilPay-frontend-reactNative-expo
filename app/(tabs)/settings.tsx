import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';
import { useAuth } from '../../src/features/auth/context/AuthContext';
import { useRouter } from 'expo-router';
import { AppLoader } from '../../src/components/AppLoader';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'arrow' | 'danger';
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  rightText?: string;
  onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  color,
  label,
  description,
  type,
  value,
  onValueChange,
  rightText,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.item}
    activeOpacity={type !== 'toggle' ? 0.6 : 1}
    onPress={onPress}
  >
    <View style={[styles.iconWrapper, { backgroundColor: color }]}>
      <Ionicons name={icon} size={22} color="#fff" />
    </View>
    <View style={styles.itemContent}>
      <Text style={[styles.itemLabel, type === 'danger' && styles.dangerText]}>{label}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
    {type === 'toggle' && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e2e8f0', true: '#dc2626' }}
        thumbColor={Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#f4f3f4'}
      />
    )}
    {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />}
    {type === 'danger' && <Ionicons name="log-out-outline" size={20} color="#ef4444" />}
    {type === 'select' && (
      <View style={styles.selectRow}>
        <Text style={styles.selectText}>{rightText}</Text>
        <Ionicons name="chevron-down" size={16} color="#64748b" />
      </View>
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleLogout = () => {
    setConfirmVisible(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setConfirmVisible(false);
      router.replace('/login');
    } catch (error) {
      setIsLoggingOut(false);
      setConfirmVisible(false);
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  };

  const cancelLogout = () => {
    if (isLoggingOut) return;
    setConfirmVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelLogout}
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Déconnexion</Text>
            <Text style={styles.modalMessage}>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={cancelLogout}
                disabled={isLoggingOut}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={confirmLogout}
                disabled={isLoggingOut}
                activeOpacity={0.8}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnDangerText}>Déconnexion</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PageHeader
        title="Paramètres"
        subtitle="Gérez vos préférences et votre compte"
        icon="settings" 
        variant="premium"
      />

      <ScrollView 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GÉNÉRAL</Text>
          <View style={styles.card}>
            <SettingItem
              icon="language-outline"
              color="#3b82f6"
              label="Langue"
              description="Choisissez votre langue d'affichage"
              type="select"
              rightText="🇫🇷 Français"
            />
            <View style={styles.separator} />
            <SettingItem
              icon="moon-outline"
              color="#8b5cf6"
              label="Mode Sombre"
              description="Réduisez la fatigue oculaire"
              type="toggle"
              value={darkMode}
              onValueChange={setDarkMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              color="#ef4444"
              label="Push Notifications"
              description="Recevez des alertes en temps réel"
              type="toggle"
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SÉCURITÉ</Text>
          <View style={styles.card}>
            <SettingItem
              icon="lock-closed-outline"
              color="#10b981"
              label="Mot de passe"
              description="Changez votre mot de passe"
              type="arrow"
            />
            <View style={styles.separator} />
            <SettingItem
              icon="finger-print-outline"
              color="#06b6d4"
              label="Biométrie"
              description="Utilisez TouchID ou FaceID"
              type="toggle"
              value={true}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MON COMPTE</Text>
          <View style={styles.card}>
            <SettingItem
              icon="person-outline"
              color="#3b82f6"
              label="Profil"
              description="Gérez vos informations personnelles"
              type="arrow"
            />
            <View style={styles.separator} />
            <SettingItem
              icon="card-outline"
              color="#06b6d4"
              label="Abonnement"
              description="Consultez votre plan actuel"
              type="arrow"
              rightText="Premium"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SESSION</Text>
          <View style={styles.card}>
            <SettingItem
              icon="log-out-outline"
              color="#ef4444"
              label="Déconnexion"
              description="Quitter votre session actuelle"
              type="danger"
              onPress={handleLogout}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>ZONE DE DANGER</Text>
          <View style={[styles.card, { borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1 }]}>
            <SettingItem
              icon="trash-outline"
              color="#ef4444"
              label="Supprimer le compte"
              description="Cette action est irréversible"
              type="arrow"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MoobilPay v1.0.0</Text>
          <Text style={styles.footerSubText}>© 2025 MoobilPay. Tous droits réservés.</Text>
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
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrapper: {
    width: 37,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  dangerText: {
    color: '#ef4444',
  },
  itemDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  footerSubText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
  },

  // Modal de confirmation déconnexion
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  modalBtnDanger: {
    backgroundColor: '#dc2626',
  },
  modalBtnDangerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

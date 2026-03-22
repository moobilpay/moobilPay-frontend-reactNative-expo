import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/features/auth/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

interface ProfileField {
  id: string;
  labelKey: 'profile_full_name' | 'profile_email' | 'profile_phone' | 'profile_country' | 'profile_city';
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  editable: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  const fullName = userData?.infos
    ? `${userData.infos.prenom} ${userData.infos.nom}`
    : user?.displayName || 'Utilisateur';

  const [fields, setFields] = useState<ProfileField[]>([
    {
      id: 'displayName',
      labelKey: 'profile_full_name',
      value: fullName,
      icon: 'person-outline',
      editable: true,
    },
    {
      id: 'email',
      labelKey: 'profile_email',
      value: user?.email || userData?.infos?.email || 'email@example.com',
      icon: 'mail-outline',
      editable: false,
    },
    {
      id: 'phone',
      labelKey: 'profile_phone',
      value: userData?.infos?.numero ? String(userData.infos.numero) : '+237 6XX XXX XXX',
      icon: 'call-outline',
      editable: true,
      keyboardType: 'phone-pad',
    },
    {
      id: 'country',
      labelKey: 'profile_country',
      value: 'Cameroun',
      icon: 'location-outline',
      editable: true,
    },
    {
      id: 'city',
      labelKey: 'profile_city',
      value: 'Douala',
      icon: 'business-outline',
      editable: true,
    },
  ]);

  const updateField = (id: string, newValue: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: newValue } : f))
    );
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert(t('profile_success'), t('profile_save_success'));
  };

  const memberSince = 'Mars 2025';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={["#230f0f", "#2e1a1a", "#3e1616"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile_title')}</Text>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: user?.photoURL || 'https://via.placeholder.com/120' }}
              style={styles.avatar}
            />
            {isEditing && (
              <TouchableOpacity style={styles.cameraBtn}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {fullName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'email@example.com'}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#dc2626" />
            <Text style={styles.memberText}>{t('profile_member_since')} {memberSince}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[styles.quickStats, { backgroundColor: colors.card }]}> 
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(220,38,38,0.1)' }]}>
              <Ionicons name="card-outline" size={20} color="#dc2626" />
            </View>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>3</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>{t('profile_subscriptions')}</Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
              <Ionicons name="wallet-outline" size={20} color="#22c55e" />
            </View>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>12</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>{t('profile_transactions')}</Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
              <Ionicons name="time-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>8</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>{t('profile_months_active')}</Text>
          </View>
        </View>

        {/* Profile Fields */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('profile_personal_info')}</Text>
        <View style={[styles.fieldsCard, { backgroundColor: colors.card }]}> 
          {fields.map((field, index) => (
            <View key={field.id}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldIconWrap}>
                  <Ionicons name={field.icon} size={18} color="#64748b" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t(field.labelKey)}</Text>
                  {isEditing && field.editable ? (
                    <TextInput
                      style={[styles.fieldInput, { color: colors.text, borderBottomColor: '#dc2626' }]}
                      value={field.value}
                      onChangeText={(text) => updateField(field.id, text)}
                      keyboardType={field.keyboardType || 'default'}
                      placeholderTextColor={colors.textMuted}
                    />
                  ) : (
                    <Text style={[styles.fieldValue, { color: colors.text }]}>{field.value}</Text>
                  )}
                </View>
                {!field.editable && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  </View>
                )}
                {isEditing && field.editable && (
                  <Ionicons name="create-outline" size={16} color={colors.textMuted} />
                )}
              </View>
              {index < fields.length - 1 && <View style={[styles.fieldSeparator, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        {/* Security Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('profile_security')}</Text>
        <View style={[styles.fieldsCard, { backgroundColor: colors.card }]}> 
          <TouchableOpacity style={styles.securityItem}>
            <View style={[styles.securityIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#10b981" />
            </View>
            <View style={styles.securityContent}>
              <Text style={[styles.securityLabel, { color: colors.text }]}>{t('profile_change_password')}</Text>
              <Text style={[styles.securityDesc, { color: colors.textMuted }]}>{t('profile_password_last_changed')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={[styles.fieldSeparator, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.securityItem}>
            <View style={[styles.securityIcon, { backgroundColor: 'rgba(6,182,212,0.1)' }]}>
              <Ionicons name="finger-print-outline" size={18} color="#06b6d4" />
            </View>
            <View style={styles.securityContent}>
              <Text style={[styles.securityLabel, { color: colors.text }]}>{t('profile_biometric_auth')}</Text>
              <Text style={[styles.securityDesc, { color: colors.textMuted }]}>{t('profile_biometric_desc')}</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{t('profile_active')}</Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.fieldSeparator, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.securityItem}>
            <View style={[styles.securityIcon, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#8b5cf6" />
            </View>
            <View style={styles.securityContent}>
              <Text style={[styles.securityLabel, { color: colors.text }]}>{t('profile_2fa')}</Text>
              <Text style={[styles.securityDesc, { color: colors.textMuted }]}>{t('profile_2fa_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>{t('profile_danger_zone')}</Text>
        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: 'rgba(239,68,68,0.15)', borderWidth: 1 }]}> 
          <TouchableOpacity
            style={styles.securityItem}
            onPress={() => Alert.alert(
              t('profile_delete'),
              t('profile_delete_confirm'),
              [{ text: t('common_cancel'), style: 'cancel' }, { text: t('common_delete'), style: 'destructive' }]
            )}
          >
            <View style={[styles.securityIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </View>
            <View style={styles.securityContent}>
              <Text style={[styles.securityLabel, { color: '#ef4444' }]}>{t('profile_delete')}</Text>
              <Text style={[styles.securityDesc, { color: colors.textMuted }]}>{t('profile_delete_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fca5a5" />
          </TouchableOpacity>
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
  headerWrapper: {
    overflow: 'hidden',
    zIndex: 10,
  },
  headerSafe: {
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.select({ android: 15, default: 10 }),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#f8fafc',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 14,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220,38,38,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  memberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  quickStatLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 12,
    marginLeft: 24,
  },
  fieldsCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  fieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#dc2626',
    paddingBottom: 4,
    paddingTop: 0,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  fieldSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 66,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  securityContent: {
    flex: 1,
  },
  securityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  securityDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22c55e',
  },
});

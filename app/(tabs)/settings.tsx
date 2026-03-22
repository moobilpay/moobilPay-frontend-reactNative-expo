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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';
import { useAuth } from '../../src/features/auth/context/AuthContext';
import { useRouter } from 'expo-router';
import { AppLoader } from '../../src/components/AppLoader';
import { useLanguage } from '../../src/context/LanguageContext';
import { useTheme } from '../../src/context/ThemeContext';

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
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={type !== 'toggle' ? 0.6 : 1}
      onPress={onPress}
    >
      <View style={[styles.iconWrapper, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.text }, type === 'danger' && styles.dangerText]}>{label}</Text>
        <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e2e8f0', true: '#dc2626' }}
          thumbColor={Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#f4f3f4'}
        />
      )}
      {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
      {type === 'danger' && <Ionicons name="log-out-outline" size={20} color="#ef4444" />}
      {type === 'select' && (
        <View style={styles.selectRow}>
          <Text style={[styles.selectText, { color: colors.textSecondary }]}>{rightText}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      t('settings_logout'),
      t('settings_logout_confirm'),
      [
        { text: t('settings_logout_cancel'), style: "cancel" },
        { 
          text: t('settings_logout'), 
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 1500));
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert(t('common_error'), t('settings_logout_error'));
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppLoader visible={isLoggingOut} message={t('settings_logging_out')} />
      
      <PageHeader 
        title={t('settings_title')} 
        subtitle={t('settings_subtitle')} 
        icon="settings" 
        variant="premium"
      />

      {/* Language Picker Modal */}
      <Modal
        visible={showLangModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLangModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings_language')}</Text>
            {[
              { key: 'fr' as const, label: t('lang_fr') },
              { key: 'en' as const, label: t('lang_en') },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[
                  styles.modalOption,
                  { borderColor: colors.border },
                  language === lang.key && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setLanguage(lang.key);
                  setShowLangModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: colors.text },
                  language === lang.key && styles.modalOptionTextActive,
                ]}>
                  {lang.label}
                </Text>
                {language === lang.key && (
                  <Ionicons name="checkmark-circle" size={22} color="#dc2626" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings_general')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="language-outline"
              color="#3b82f6"
              label={t('settings_language')}
              description={t('settings_language_desc')}
              type="select"
              rightText={language === 'fr' ? t('lang_fr') : t('lang_en')}
              onPress={() => setShowLangModal(true)}
            />
            <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            <SettingItem
              icon="moon-outline"
              color="#8b5cf6"
              label={t('settings_dark_mode')}
              description={t('settings_dark_mode_desc')}
              type="toggle"
              value={isDark}
              onValueChange={toggleTheme}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings_notifications_section')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="notifications-outline"
              color="#ef4444"
              label={t('settings_push')}
              description={t('settings_push_desc')}
              type="toggle"
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings_security')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="lock-closed-outline"
              color="#10b981"
              label={t('settings_password')}
              description={t('settings_password_desc')}
              type="arrow"
            />
            <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            <SettingItem
              icon="finger-print-outline"
              color="#06b6d4"
              label={t('settings_biometrics')}
              description={t('settings_biometrics_desc')}
              type="toggle"
              value={true}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings_account')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="person-outline"
              color="#3b82f6"
              label={t('settings_profile')}
              description={t('settings_profile_desc')}
              type="arrow"
              onPress={() => router.push('/profile')}
            />
            <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            <SettingItem
              icon="card-outline"
              color="#06b6d4"
              label={t('settings_subscription')}
              description={t('settings_subscription_desc')}
              type="arrow"
              rightText={t('common_premium')}
              onPress={() => router.push('/accounts')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings_session')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingItem
              icon="log-out-outline"
              color="#ef4444"
              label={t('settings_logout')}
              description={t('settings_logout_desc')}
              type="danger"
              onPress={handleLogout}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>{t('settings_danger_zone')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1 }]}>
            <SettingItem
              icon="trash-outline"
              color="#ef4444"
              label={t('settings_delete_account')}
              description={t('settings_delete_account_desc')}
              type="arrow"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>{t('settings_version')}</Text>
          <Text style={[styles.footerSubText, { color: colors.textMuted }]}>{t('settings_copyright')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  modalOptionActive: {
    borderColor: '#dc2626',
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOptionTextActive: {
    color: '#dc2626',
  },
});

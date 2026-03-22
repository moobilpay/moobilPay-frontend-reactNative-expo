import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

const STREAMING_ACCOUNTS = [
  {
    id: '1',
    platform: 'Netflix',
    email: 'user@netflix.com',
    plan: 'Premium',
    icon: 'play-circle',
    color: '#E50914',
    gradient: ['#E50914', '#B20710'] as const,
    profiles: 4,
    status: 'active',
    expiry: '15 Avr 2026',
  },
  {
    id: '2',
    platform: 'Disney+',
    email: 'user@disney.com',
    plan: 'Standard',
    icon: 'star',
    color: '#0063E5',
    gradient: ['#0063E5', '#0040A0'] as const,
    profiles: 4,
    status: 'active',
    expiry: '22 Mai 2026',
  },
  {
    id: '3',
    platform: 'Spotify',
    email: 'user@spotify.com',
    plan: 'Family',
    icon: 'musical-notes',
    color: '#1DB954',
    gradient: ['#1DB954', '#158E3E'] as const,
    profiles: 6,
    status: 'active',
    expiry: '10 Juin 2026',
  },
  {
    id: '4',
    platform: 'Amazon Prime',
    email: 'user@amazon.com',
    plan: 'Standard',
    icon: 'cart',
    color: '#FF9900',
    gradient: ['#FF9900', '#E68A00'] as const,
    profiles: 3,
    status: 'expired',
    expiry: 'Expiré',
  },
];

export default function AccountsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'expired'>('all');

  const filteredAccounts = STREAMING_ACCOUNTS.filter((acc) => {
    if (selectedTab === 'active') return acc.status === 'active';
    if (selectedTab === 'expired') return acc.status === 'expired';
    return true;
  });

  const activeCount = STREAMING_ACCOUNTS.filter(a => a.status === 'active').length;
  const expiredCount = STREAMING_ACCOUNTS.filter(a => a.status === 'expired').length;

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
            <Text style={styles.headerTitle}>{t('accounts_title')}</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{STREAMING_ACCOUNTS.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('accounts_total')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>{activeCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('accounts_active')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{expiredCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('accounts_expired')}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'all', label: t('accounts_all') },
          { key: 'active', label: t('accounts_active') },
          { key: 'expired', label: t('accounts_expired') },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              { backgroundColor: colors.inputBg },
              selectedTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                selectedTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account List */}
      <ScrollView
        style={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {filteredAccounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[styles.accountCard, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.cardLeft}>
              <LinearGradient
                colors={[...account.gradient]}
                style={styles.platformIcon}
              >
                <Ionicons name={account.icon as any} size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.platformName, { color: colors.text }]}>{account.platform}</Text>
                  <View style={[
                    styles.statusBadge,
                    account.status === 'active' ? styles.statusActive : styles.statusExpired
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: account.status === 'active' ? '#22c55e' : '#ef4444' }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: account.status === 'active' ? '#22c55e' : '#ef4444' }
                    ]}>
                      {account.status === 'active' ? t('accounts_active') : t('accounts_expired')}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>{account.email}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="diamond-outline" size={12} color="#94a3b8" />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>{account.plan}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={12} color="#94a3b8" />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>{account.profiles} {t('accounts_profiles')}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>{account.expiry}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        {filteredAccounts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('accounts_no_account')}</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>{t('accounts_no_result')}</Text>
          </View>
        )}
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#f1f5f9',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1e293b',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusExpired: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accountEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

export default function ShareScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const SHARE_METHODS = [
    {
      id: 'whatsapp',
      label: t('share_method_whatsapp'),
      icon: 'logo-whatsapp',
      color: '#25D366',
      gradient: ['#25D366', '#128C7E'] as const,
      action: () => Linking.openURL('whatsapp://send?text=Découvre MoobilPay ! L\'app pour gérer tes abonnements streaming facilement 🎬🎵 Télécharge-la ici : https://moobilpay.com/download'),
    },
    {
      id: 'sms',
      label: t('share_method_sms'),
      icon: 'chatbubble-outline',
      color: '#3b82f6',
      gradient: ['#3b82f6', '#2563eb'] as const,
      action: () => Linking.openURL('sms:?body=Découvre MoobilPay ! L\'app pour gérer tes abonnements streaming facilement 🎬🎵 https://moobilpay.com/download'),
    },
    {
      id: 'telegram',
      label: t('share_method_telegram'),
      icon: 'paper-plane-outline',
      color: '#0088cc',
      gradient: ['#0088cc', '#006699'] as const,
      action: () => Linking.openURL('https://t.me/share/url?url=https://moobilpay.com/download&text=Découvre MoobilPay !'),
    },
    {
      id: 'copy',
      label: t('share_method_copy_link'),
      icon: 'copy-outline',
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'] as const,
      action: null,
    },
    {
      id: 'facebook',
      label: t('share_method_facebook'),
      icon: 'logo-facebook',
      color: '#1877F2',
      gradient: ['#1877F2', '#0C5DC7'] as const,
      action: () => Linking.openURL('https://www.facebook.com/sharer/sharer.php?u=https://moobilpay.com/download'),
    },
    {
      id: 'more',
      label: t('share_method_more'),
      icon: 'ellipsis-horizontal-outline',
      color: '#64748b',
      gradient: ['#64748b', '#475569'] as const,
      action: null,
    },
  ];

  const REWARDS = [
    {
      id: '1',
      title: t('share_reward_bronze_title'),
      description: t('share_reward_bronze_desc'),
      reward: t('share_reward_bronze_reward'),
      icon: 'medal-outline',
      color: '#CD7F32',
      progress: 1,
      total: 3,
    },
    {
      id: '2',
      title: t('share_reward_silver_title'),
      description: t('share_reward_silver_desc'),
      reward: t('share_reward_silver_reward'),
      icon: 'ribbon-outline',
      color: '#C0C0C0',
      progress: 1,
      total: 10,
    },
    {
      id: '3',
      title: t('share_reward_gold_title'),
      description: t('share_reward_gold_desc'),
      reward: t('share_reward_gold_reward'),
      icon: 'trophy-outline',
      color: '#FFD700',
      progress: 1,
      total: 25,
    },
  ];

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: t('share_native_message'),
        title: t('share_native_title'),
      });
    } catch {
      console.log('Share cancelled');
    }
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralCode = 'MOOBIL-A3X9';
  const invitedCount = 1;

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
            <Text style={styles.headerTitle}>{t('share_title')}</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#dc2626', '#b91c1c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBg}
          >
            <View style={styles.heroIconRow}>
              <View style={styles.heroIcon}>
                <Ionicons name="gift-outline" size={32} color="#fff" />
              </View>
            </View>
            <Text style={styles.heroTitle}>{t('share_invite_title')}</Text>
            <Text style={styles.heroDesc}>
              {t('share_invite_desc')}
            </Text>

            {/* Referral Code */}
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{t('share_code_label')}</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>{referralCode}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{invitedCount}</Text>
                <Text style={styles.heroStatLabel}>{t('share_invited')}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>500F</Text>
                <Text style={styles.heroStatLabel}>{t('share_earned')}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>2</Text>
                <Text style={styles.heroStatLabel}>{t('share_pending')}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Share Methods */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('share_via')}</Text>
        <View style={styles.shareGrid}>
          {SHARE_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.shareItem}
              onPress={() => {
                if (method.id === 'copy') handleCopyLink();
                else if (method.id === 'more') handleNativeShare();
                else if (method.action) method.action();
              }}
              activeOpacity={0.7}
            >
              <LinearGradient colors={[...method.gradient]} style={styles.shareIcon}>
                <Ionicons name={method.icon as any} size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.shareLabel}>
                {method.id === 'copy' && copied ? t('share_copied') : method.id === 'copy' ? t('share_copy_link') : method.id === 'more' ? t('share_more') : method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rewards */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('share_rewards')}</Text>
        {REWARDS.map((reward) => (
          <View key={reward.id} style={[styles.rewardCard, { backgroundColor: colors.card }]}>
            <View style={[styles.rewardIconWrapper, { backgroundColor: reward.color + '18' }]}>
              <Ionicons name={reward.icon as any} size={24} color={reward.color} />
            </View>
            <View style={styles.rewardInfo}>
              <View style={styles.rewardTitleRow}>
                <Text style={[styles.rewardTitle, { color: colors.text }]}>{reward.title}</Text>
                <Text style={styles.rewardBadge}>{reward.reward}</Text>
              </View>
              <Text style={[styles.rewardDesc, { color: colors.textMuted }]}>{reward.description}</Text>
              <View style={styles.progressBarOuter}>
                <View
                  style={[
                    styles.progressBarInner,
                    { width: `${(reward.progress / reward.total) * 100}%`, backgroundColor: reward.color },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>{reward.progress}/{reward.total} {t('share_invitations')}</Text>
            </View>
          </View>
        ))}

        {/* How it works */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('share_how_it_works')}</Text>
        <View style={[styles.stepsCard, { backgroundColor: colors.card }]}> 
          {[
            { step: '1', title: t('share_step1_title'), desc: t('share_step1_desc'), icon: 'share-outline' },
            { step: '2', title: t('share_step2_title'), desc: t('share_step2_desc'), icon: 'person-add-outline' },
            { step: '3', title: t('share_step3_title'), desc: t('share_step3_desc'), icon: 'gift-outline' },
          ].map((item, index) => (
            <View key={item.step} style={styles.stepItem}>
              <View style={styles.stepLeft}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                {index < 2 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color="#dc2626" />
                </View>
                <View style={styles.stepTextWrap}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.stepDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Big Share Button */}
        <TouchableOpacity style={styles.bigShareBtn} onPress={handleNativeShare} activeOpacity={0.8}>
          <LinearGradient
            colors={['#dc2626', '#b91c1c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bigShareGradient}
          >
            <Ionicons name="share-social" size={22} color="#fff" />
            <Text style={styles.bigShareText}>{t('share_now')}</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  heroCard: {
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroBg: {
    padding: 24,
    alignItems: 'center',
  },
  heroIconRow: {
    marginBottom: 12,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  codeBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 28,
    marginBottom: 16,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  shareItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  shareIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  rewardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  rewardBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rewardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  progressBarOuter: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stepItem: {
    flexDirection: 'row',
    minHeight: 70,
  },
  stepLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  stepDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  bigShareBtn: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bigShareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  bigShareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

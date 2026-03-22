import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'Comment souscrire à un abonnement ?',
    answer: 'Rendez-vous sur la page d\'accueil, sélectionnez un service dans la section "Services & Streaming", puis choisissez votre plan et suivez les étapes de paiement.',
    icon: 'card-outline',
    category: 'payment',
  },
  {
    id: '2',
    question: 'Comment partager mon compte ?',
    answer: 'Allez dans "Mes Comptes", sélectionnez le compte que vous souhaitez partager, puis appuyez sur "Partager l\'accès". Vous pouvez envoyer un lien d\'invitation par SMS ou WhatsApp.',
    icon: 'share-social-outline',
    category: 'account',
  },
  {
    id: '3',
    question: 'Quels moyens de paiement sont acceptés ?',
    answer: 'Nous acceptons Orange Money, MTN Mobile Money, les cartes bancaires (Visa/Mastercard) et PayPal. Les paiements sont sécurisés et chiffrés.',
    icon: 'wallet-outline',
    category: 'payment',
  },
  {
    id: '4',
    question: 'Comment annuler un abonnement ?',
    answer: 'Accédez à "Mes Activations", sélectionnez l\'abonnement concerné et appuyez sur "Ne pas renouveler". L\'abonnement restera actif jusqu\'à sa date d\'expiration.',
    icon: 'close-circle-outline',
    category: 'account',
  },
  {
    id: '5',
    question: 'Mon paiement a échoué, que faire ?',
    answer: 'Vérifiez votre solde, puis réessayez. Si le problème persiste, contactez notre support via WhatsApp ou par email. Aucun montant n\'est débité en cas d\'échec.',
    icon: 'alert-circle-outline',
    category: 'payment',
  },
  {
    id: '6',
    question: 'Comment changer mon mot de passe ?',
    answer: 'Allez dans Paramètres > Sécurité > Mot de passe. Vous recevrez un email de réinitialisation sur votre adresse email associée.',
    icon: 'lock-closed-outline',
    category: 'security',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const SUPPORT_OPTIONS = [
    {
      id: 'whatsapp',
      label: t('help_support_whatsapp'),
      desc: t('help_support_whatsapp_desc'),
      icon: 'logo-whatsapp',
      color: '#25D366',
      gradient: ['#25D366', '#128C7E'] as const,
      action: () => Linking.openURL('https://wa.me/237600000000'),
    },
    {
      id: 'email',
      label: t('help_support_email'),
      desc: t('help_support_email_desc'),
      icon: 'mail-outline',
      color: '#3b82f6',
      gradient: ['#3b82f6', '#2563eb'] as const,
      action: () => Linking.openURL('mailto:support@moobilpay.com'),
    },
    {
      id: 'call',
      label: t('help_support_phone'),
      desc: t('help_support_phone_desc'),
      icon: 'call-outline',
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'] as const,
      action: () => Linking.openURL('tel:+237600000000'),
    },
  ];

  const filteredFaq = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Text style={styles.headerTitle}>{t('help_title')}</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          placeholder={t('help_search')}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Support Options */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('help_contact')}</Text>
        <View style={styles.supportGrid}>
          {SUPPORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.supportCard, { backgroundColor: colors.card }]}
              onPress={opt.action}
              activeOpacity={0.7}
            >
              <LinearGradient colors={[...opt.gradient]} style={styles.supportIcon}>
                <Ionicons name={opt.icon as any} size={22} color="#fff" />
              </LinearGradient>
              <Text style={[styles.supportLabel, { color: colors.text }]}>{opt.label}</Text>
              <Text style={[styles.supportDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('help_faq')}</Text>
        {filteredFaq.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.faqCard,
                { backgroundColor: colors.card },
                isExpanded && styles.faqCardExpanded,
              ]}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqIconWrapper}>
                  <Ionicons name={item.icon as any} size={20} color="#dc2626" />
                </View>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.question}</Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                />
              </View>
              {isExpanded && (
                <View style={styles.faqBody}>
                  <View style={[styles.faqDivider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredFaq.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('help_no_result')}</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>{t('help_no_result_desc')}</Text>
          </View>
        )}

        {/* Footer Help */}
        <View style={[styles.footerCard, { backgroundColor: colors.card }]}>
          <Ionicons name="chatbubbles-outline" size={32} color="#dc2626" />
          <Text style={[styles.footerTitle, { color: colors.text }]}>{t('help_more_help')}</Text>
          <Text style={[styles.footerDesc, { color: colors.textMuted }]}>{t('help_more_help_desc')}</Text>
          <TouchableOpacity style={styles.footerBtn} onPress={() => Linking.openURL('https://wa.me/237600000000')}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.footerBtnText}>{t('help_whatsapp')}</Text>
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
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 46,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: '#1e293b',
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 14,
  },
  supportGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  supportCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  supportLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  supportDesc: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  faqCardExpanded: {
    borderColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  faqBody: {
    marginTop: 12,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
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
  footerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
  },
  footerDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
  },
  footerBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

const CATEGORIES = [
  { id: 'all', labelKey: 'news_all', icon: 'apps-outline' },
  { id: 'trending', labelKey: 'news_trending', icon: 'trending-up-outline' },
  { id: 'netflix', label: 'Netflix', icon: 'play-circle-outline' },
  { id: 'disney', label: 'Disney+', icon: 'star-outline' },
  { id: 'new', labelKey: 'news_new', icon: 'sparkles-outline' },
];

const FEATURED_NEWS = {
  id: 'featured',
  title: 'Stranger Things : Saison 5 arrive cet été',
  description: 'La dernière saison de la série phénomène de Netflix sera diffusée en deux parties. Découvrez les premières images exclusives.',
  image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800',
  category: 'Netflix',
  date: 'Il y a 2h',
  readTime: '4 min',
};

const NEWS_ITEMS = [
  {
    id: '1',
    title: 'Disney+ augmente ses tarifs en Afrique',
    description: 'Le service de streaming ajuste ses prix pour le marché africain avec de nouveaux forfaits adaptés.',
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=400',
    category: 'Disney+',
    date: 'Il y a 5h',
    readTime: '3 min',
    tag: 'Pricing',
    tagColor: '#3b82f6',
  },
  {
    id: '2',
    title: 'Les 10 films les plus regardés ce mois',
    description: 'Classement mensuel des films les plus populaires sur les plateformes de streaming disponibles.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400',
    category: 'Tendances',
    date: 'Il y a 8h',
    readTime: '5 min',
    tag: 'Top 10',
    tagColor: '#dc2626',
  },
  {
    id: '3',
    title: 'Spotify lance les podcasts vidéo',
    description: 'La plateforme musicale étend ses fonctionnalités avec le support des podcasts en format vidéo.',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400',
    category: 'Spotify',
    date: 'Hier',
    readTime: '2 min',
    tag: 'Nouveau',
    tagColor: '#1DB954',
  },
  {
    id: '4',
    title: 'Avatar 3 : première bande-annonce dévoilée',
    description: 'James Cameron révèle les premières images du troisième volet de la saga Avatar, attendu pour 2026.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400',
    category: 'Cinéma',
    date: 'Hier',
    readTime: '3 min',
    tag: 'Exclu',
    tagColor: '#8b5cf6',
  },
  {
    id: '5',
    title: 'Netflix : le partage de compte évolue',
    description: 'De nouvelles règles pour le partage de compte entrent en vigueur. Ce qui change pour les utilisateurs.',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e84875a?q=80&w=400',
    category: 'Netflix',
    date: 'Il y a 2j',
    readTime: '4 min',
    tag: 'Important',
    tagColor: '#f59e0b',
  },
  {
    id: '6',
    title: 'Les meilleures séries à binge-watcher',
    description: 'Notre sélection des séries incontournables à regarder pendant le week-end sur toutes les plateformes.',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=400',
    category: 'Sélection',
    date: 'Il y a 3j',
    readTime: '6 min',
    tag: 'Sélection',
    tagColor: '#06b6d4',
  },
];

export default function NewsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

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
            <Text style={styles.headerTitle}>{t('news_title')}</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="bookmark-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              { backgroundColor: colors.inputBg },
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? '#fff' : '#64748b'}
            />
            <Text
              style={[
                styles.categoryText,
                { color: colors.textSecondary },
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.labelKey ? t(cat.labelKey as any) : cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Featured Article */}
        <TouchableOpacity style={styles.featuredCard} activeOpacity={0.85}>
          <Image source={{ uri: FEATURED_NEWS.image }} style={styles.featuredImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.featuredOverlay}
          >
            <View style={styles.featuredBadge}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.featuredBadgeText}>{t('news_featured')}</Text>
            </View>
            <Text style={styles.featuredTitle}>{FEATURED_NEWS.title}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>{FEATURED_NEWS.description}</Text>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="play-circle" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText}>{FEATURED_NEWS.category}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText}>{FEATURED_NEWS.readTime} {t('news_read_time')}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metaText}>{FEATURED_NEWS.date}</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* News List */}
        <View style={styles.newsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('news_latest')}</Text>
          {NEWS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.newsCard, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.image }} style={styles.newsImage} />
              <View style={styles.newsInfo}>
                <View style={styles.newsTagRow}>
                  <View style={[styles.newsTag, { backgroundColor: item.tagColor + '18' }]}>
                    <Text style={[styles.newsTagText, { color: item.tagColor }]}>{item.tag}</Text>
                  </View>
                  <Text style={[styles.newsDate, { color: colors.textMuted }]}>{item.date}</Text>
                </View>
                <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.newsDesc, { color: colors.textMuted }]} numberOfLines={2}>{item.description}</Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.newsCategory}>{item.category}</Text>
                  <Text style={[styles.newsReadTime, { color: colors.textMuted }]}>{item.readTime} {t('news_read_time')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  categoriesScroll: {
    maxHeight: 56,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  categoryChipActive: {
    backgroundColor: '#1e293b',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 240,
    backgroundColor: '#1e293b',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 26,
  },
  featuredDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    lineHeight: 18,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  newsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  newsImage: {
    width: 110,
    height: 130,
    resizeMode: 'cover',
  },
  newsInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  newsTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newsTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newsTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  newsDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 19,
    marginTop: 4,
  },
  newsDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    marginTop: 2,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  newsCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  newsReadTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
});

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "../../src/features/auth/context/AuthContext";
import { Config } from "../../src/api/config";
import { usePaymentSocket } from "../../src/features/payment/hooks/usePaymentSocket";
import { storage } from "../../src/utils/storage";
import { useResponsiveWidth } from "../../src/utils/useResponsiveWidth";
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useResponsiveWidth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState("all");

  // ── États des données ──
  const [activations, setActivations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bestPlan, setBestPlan] = useState<any>(null);

  const fetchActivations = async (isRefreshing = false) => {
    if (!user?.uid) return;
    
    // 1. Tenter de charger le CACHE immédiatement pour la rapidité
    if (!isRefreshing && activations.length === 0) {
      const cached = await storage.get(`activations_${user.uid}`);
      if (cached) {
        console.log("📦 [HOME-CACHE] Chargé depuis le stockage local");
        setActivations(cached);
        if (cached.length > 0) {
          const active = cached.find((p: any) => p.statut === 'active') || cached[0];
          setBestPlan(active);
        }
        setLoading(false); // On a déjà quelque chose à montrer
      }
    }

    if (isRefreshing) setRefreshing(true);
    else if (activations.length === 0) setLoading(true);

    try {
      console.log(`📡 [FETCH-HOME] Synchronisation avec le backend: ${user.uid}`);
      const response = await axios.get(`${Config.apiUrl}/api/plan-activation/user/${user.uid}`);
      
      if (response.data.success) {
        const newList = response.data.data || [];
        
        // Comparer avec la version actuelle (optimisation rendu)
        if (JSON.stringify(newList) !== JSON.stringify(activations)) {
          console.log("✨ [FETCH-HOME] Mise à jour des données (Changements détectés)");
          setActivations(newList);
          
          if (newList.length > 0) {
            const active = newList.find((p: any) => p.statut === 'active') || newList[0];
            setBestPlan(active);
          } else {
            setBestPlan(null);
          }
          
          // Sauvegarder dans le cache local
          await storage.set(`activations_${user.uid}`, newList);
        } else {
          console.log("😴 [FETCH-HOME] Aucune différence détectée avec le cache");
        }
      }
    } catch (err: any) {
      console.error("❌ [FETCH-ERROR] Impossible de synchroniser les activations:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivations();
  }, [user?.uid]);

  // ── SOCKET TEMPS RÉEL (Nouvelle Archi) ──
  usePaymentSocket({
    onActivationCreated: () => {
      console.log("🔥 [HOME-SOCKET] Nouvelle activation ! Rafraîchissement...");
      fetchActivations();
    }
  });

  // ── Filtrage et Sliders ──
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const serviceScrollRef = useRef<ScrollView>(null);
  const serviceAutoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeServiceIndexRef = useRef(0);

  // ── Données Statiques Originales (Streaming Services) ──
  const staticServices = [
    {
      id: 1,
      title: t('home_service_netflix_title'),
      subtitle: t('home_service_netflix_subtitle'),
      price: "2000F",
      status: t('home_status_active'),
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e84875a?q=80&w=600",
      active: true
    },
    {
      id: 2,
      title: t('home_service_disney_title'),
      subtitle: t('home_service_disney_subtitle'),
      price: "1500F",
      status: t('home_status_inactive'),
      image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600",
      active: false
    },
    {
      id: 3,
      title: t('home_service_spotify_title'),
      subtitle: t('home_service_spotify_subtitle'),
      price: "800F",
      status: t('home_status_active'),
      image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=600",
      active: true
    }
  ];

  const startServiceAutoScroll = useCallback(() => {
    if (serviceAutoScrollTimer.current) clearInterval(serviceAutoScrollTimer.current);
    serviceAutoScrollTimer.current = setInterval(() => {
      const slideWidth = width - 40;
      const nextIndex = (activeServiceIndexRef.current + 1) % staticServices.length;
      activeServiceIndexRef.current = nextIndex;
      setActiveServiceIndex(nextIndex);
      serviceScrollRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
    }, 4000);
  }, [width]);

  useEffect(() => {
    activeServiceIndexRef.current = activeServiceIndex;
  }, [activeServiceIndex]);

  useEffect(() => {
    startServiceAutoScroll();
    return () => {
      if (serviceAutoScrollTimer.current) clearInterval(serviceAutoScrollTimer.current);
    };
  }, [startServiceAutoScroll]);

  // ── Calculs dynamiques pour un plan donné ──
  const getPlanStats = (plan: any) => {
    if (!plan) return { price: "0.00", daysLeft: 0, progress: 0, planName: t('home_service_plan_default'), email: "" };

    const now = new Date();
    const expiry = new Date(plan.dateExpiration);
    const start = new Date(plan.dateDebut || plan.dateCreation);
    
    const diffTime = expiry.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const totalTime = expiry.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    let progress = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;
    progress = Math.min(100, Math.max(0, progress));

    return {
      price: plan.amount?.toString() || "0.00",
      daysLeft,
      progress: 100 - progress,
      planName: `Netflix ${plan.planNetflix || t('home_service_plan_default')}`,
      email: plan.email || t('home_service_loading_email')
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ─── CUSTOM HOME HEADER ─── */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#230f0f", "#2e1a1a", "#3e1616"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBg}
        />
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.headerRow}>
            {/* Barre de recherche */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                placeholder={t('home_search')}
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.searchInput}
              />
            </View>

            {/* Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => router.push('/settings')}
              >
                <Image
                  source={{ uri: user?.photoURL || "https://via.placeholder.com/100" }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchActivations(true)} />
        }
      >
        {/* Chips de filtrage */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterSection}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: "all", icon: "apps-outline", label: t('home_filter_all') },
            { id: "streaming", icon: "play-circle-outline", label: t('home_filter_streaming') },
            { id: "music", icon: "musical-notes-outline", label: t('home_filter_music') },
            { id: "gaming", icon: "game-controller-outline", label: t('home_filter_gaming') },
            { id: "productivity", icon: "briefcase-outline", label: t('home_filter_productivity') },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={18}
                color={selectedFilter === filter.id ? "#fff" : "#64748b"}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Infos & Compte à rebours (SLIDER) */}
        <View style={styles.planSliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / (width - 40));
              setActivePlanIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {activations.length > 0 ? (
              activations.map((act) => {
                const stats = getPlanStats(act);
                return (
                  <View key={act.id} style={[styles.statsCard, { width: width - 40, backgroundColor: colors.card }]}>
                    <View style={styles.cardTopRow}>
                      <Text style={[styles.cardEmail, { color: colors.textSecondary, backgroundColor: isDark ? colors.border : '#f1f5f9' }]}>{stats.email}</Text>
                      <Ionicons name="flash-sharp" size={14} color="#dc2626" />
                    </View>

                    <View style={styles.statsHeader}>
                      <Text style={[styles.statsPrice, { color: colors.text }]}>
                        <Text style={{ fontSize: 18 }}>$</Text>
                        {stats.price}
                      </Text>
                      <Text style={styles.daysCounter}>{stats.daysLeft}</Text>
                    </View>
                    
                    <View style={styles.statsLabels}>
                      <Text style={styles.statsSub}>{t('home_days_left')}</Text>
                      <Text style={styles.statsSub}>{t('home_days')}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                        <LinearGradient
                          colors={["#dc2626", "#ef4444", "#f87171"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${stats.progress}%` }]}
                        />
                        <View style={[styles.progressIndicator, { left: `${stats.progress}%` }]}>
                          <View style={styles.indicatorDot} />
                        </View>
                      </View>
                    </View>

                    <View style={styles.planInfo}>
                      <Text style={[styles.planLabel, { color: colors.textSecondary }]}>{t('home_plan_label')}: {stats.planName}</Text>
                      <Text style={[styles.planDuration, { color: colors.textSecondary }]}>{t('home_plan_duration')}</Text>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.resubscribeBtn} onPress={() => router.push('/pay')}>
                        <Ionicons name="flash-sharp" size={16} color="#fff" />
                        <Text style={styles.btnText}>{t('home_resubscribe')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.unsubscribeBtn} onPress={() => router.push('/pay')}>
                        <Ionicons name="add-circle-outline" size={18} color="#ef4444" />
                        <Text style={styles.btnTextOutline}>{t('home_add')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={[styles.statsCard, { opacity: 0.6, width: width - 40, backgroundColor: colors.card }]}>
                <Text style={styles.noPlanMessage}>{t('home_no_active_plan')}</Text>
                <TouchableOpacity style={styles.resubscribeBtn} onPress={() => router.push('/pay')}>
                  <Text style={styles.btnText}>{t('home_discover_plans')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          
          {activations.length > 1 && (
            <View style={styles.planPagination}>
              {activations.map((_, i) => (
                <View key={i} style={[styles.planDot, i === activePlanIndex && styles.planDotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* Séparateur */}
        <View style={[styles.subtleSeparator, { backgroundColor: colors.border }]} />

        {/* Section Services & Streaming */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="play-circle" size={24} color="#dc2626" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home_services_title')}</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{t('home_services_desc')}</Text>
        </View>

        {/* Slider des services & Streaming (Auto-scroll) */}
        <View style={styles.servicesSliderWrapper}>
          <ScrollView
            ref={serviceScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const slideWidth = width - 40;
              const index = Math.round(x / slideWidth);
              if (index !== activeServiceIndex) setActiveServiceIndex(index);
            }}
            onTouchStart={() => {
              if (serviceAutoScrollTimer.current) clearInterval(serviceAutoScrollTimer.current);
            }}
            onTouchEnd={() => startServiceAutoScroll()}
            onScrollBeginDrag={() => {
              if (serviceAutoScrollTimer.current) clearInterval(serviceAutoScrollTimer.current);
            }}
            onScrollEndDrag={() => startServiceAutoScroll()}
            scrollEventThrottle={16}
          >
            {staticServices.map((service) => (
              <TouchableOpacity key={service.id} style={[styles.serviceSlide, { width: width - 40 }]} onPress={() => router.push('/pay')}>
                <Image source={{ uri: service.image }} style={styles.slideImage} />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.9)"]}
                  style={styles.slideOverlay}
                >
                  <View style={styles.slideContent}>
                    <Text style={styles.slideTitle}>{service.title}</Text>
                    <Text style={styles.slideSubtitleText}>{service.subtitle}</Text>
                    <View style={styles.slideBadgesRow}>
                      <View style={styles.priceBadgeContainer}>
                        <Text style={styles.priceBadgeText}>{service.price}</Text>
                      </View>
                      <View style={[styles.statusBadgeContainer, service.active ? styles.statusActive : styles.statusInactive]}>
                        <Text style={styles.statusBadgeText}>{service.status}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.sliderPagination}>
            {staticServices.map((_, i) => (
              <View key={i} style={[styles.paginationDot, i === activeServiceIndex && styles.paginationDotActive]} />
            ))}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsGrid}>
          {[
            { id: "accounts", icon: "people-outline", label: t('home_accounts'), route: "/accounts" },
            { id: "help", icon: "help-circle-outline", label: t('home_help'), route: "/help" },
            { id: "news", icon: "film-outline", label: t('home_news'), route: "/news" },
            { id: "share", icon: "share-social-outline", label: t('home_share'), route: "/share" },
          ].map((item) => (
            <TouchableOpacity key={item.id} style={styles.actionCard} onPress={() => router.push(item.route as any)}>
              <View style={[styles.actionCardIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name={item.icon as any} size={22} color="#dc2626" />
              </View>
              <Text style={[styles.actionCardLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Séparateur */}
        <View style={[styles.subtleSeparator, { backgroundColor: colors.border }]} />

        {/* Section Découvrir & Divertissement */}
        <View style={styles.discoverSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles" size={24} color="#dc2626" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home_discover')}</Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{t('home_discover_desc')}</Text>
          </View>

          <View style={styles.discoverGrid}>
            <TouchableOpacity style={[styles.discoverCard, { width: (width - 40) / 2 - 6 }]}>
              <LinearGradient colors={["#dc2626", "#ef4444"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="film-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>{t('home_cinema')}</Text>
                  <Text style={styles.discoverCardDesc}>{t('home_cinema_desc')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.discoverCard, { width: (width - 40) / 2 - 6 }]}>
              <LinearGradient colors={["#7c3aed", "#a855f7"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="game-controller-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="trophy" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>{t('home_gaming')}</Text>
                  <Text style={styles.discoverCardDesc}>{t('home_gaming_desc')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.discoverCard, { width: (width - 40) / 2 - 6 }]}>
              <LinearGradient colors={["#059669", "#10b981"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="bag-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="flash" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>{t('home_shopping')}</Text>
                  <Text style={styles.discoverCardDesc}>{t('home_shopping_desc')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.discoverCard, { width: (width - 40) / 2 - 6 }]}>
              <LinearGradient colors={["#ea580c", "#f97316"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="people-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="heart" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>{t('home_social')}</Text>
                  <Text style={styles.discoverCardDesc}>{t('home_social_desc')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    ...(Platform.OS === 'web' ? { overflow: 'hidden' as any, maxWidth: '100%' as any } : {}),
  },
  header: {
    position: 'relative',
    zIndex: 10,
    overflow: 'hidden',
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.select({ android: 15, web: 10, default: 10 }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: '#dc2626',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1a1a2e',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    ...(Platform.OS === 'web' ? { overflowX: 'hidden' as any } : {}),
  },
  filterSection: {
    marginVertical: 20,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  planSliderContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardEmail: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planPagination: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
  },
  planDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  planDotActive: {
    width: 16,
    backgroundColor: '#dc2626',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
  },
  daysCounter: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ef4444',
  },
  statsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statsSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressIndicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    marginLeft: -10,
  },
  indicatorDot: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  planDuration: {
    fontSize: 13,
    color: '#64748b',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resubscribeBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  unsubscribeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnTextOutline: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  noPlanMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtleSeparator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 20,
    marginVertical: 24,
    opacity: 0.6,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  servicesSliderWrapper: {
    marginHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  serviceSlide: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    ...(Platform.OS === 'web' ? { objectFit: 'cover' as any } : {}),
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  slideContent: {
    width: '100%',
  },
  slideTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  slideSubtitleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  slideBadgesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priceBadgeContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  statusInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.9)',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  sliderPagination: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#dc2626',
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginTop: 20,
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? { overflow: 'hidden' as any, flexWrap: 'nowrap' as any } : {}),
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionCardIcon: {
    width: 54,
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  actionCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  discoverSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
    ...(Platform.OS === 'web' ? { overflow: 'hidden' as any } : {}),
  },
  discoverCard: {
    height: 110,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardInternal: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMiniBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  discoverCardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
});

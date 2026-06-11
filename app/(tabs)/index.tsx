import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "../../src/features/auth/context/AuthContext";
import { Config } from "../../src/api/config";
import { usePaymentSocket } from "../../src/features/payment/hooks/usePaymentSocket";
import { storage } from "../../src/utils/storage";
import { PageHeader } from "../../src/components/PageHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReviewMode } from "../../src/context/ReviewModeContext";
import SubscriptionCard from "../../src/components/SubscriptionCard";
import AddSubscriptionSheet from "../../src/components/AddSubscriptionSheet";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 92; // safe area + hauteur contenu (searchbar ~56 + paddings) + marge
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { reviewMode, ready } = useReviewMode();
  // Bottom sheet d'ajout d'abonnement (mode review uniquement).
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  // Entrées pas encore implémentées : feedback clair au clic (Apple Guideline 2.1).
  const handleComingSoon = () => {
    Alert.alert(
      'Bientôt disponible',
      "Cette fonctionnalité sera disponible dans une prochaine mise à jour."
    );
  };

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

  // ── Données Statiques Originales (Streaming Services) ──
  const staticServices = [
    {
      id: 1,
      title: "Netflix Premium",
      subtitle: "Compte partagé • 4 écrans",
      price: "2000F",
      status: "Actif",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e84875a?q=80&w=600",
      active: true
    },
    {
      id: 2,
      title: "Disney+ Premium",
      subtitle: "Famille • 4 profils",
      price: "1500F",
      status: "Inactif",
      image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600",
      active: false
    },
    {
      id: 3,
      title: "Spotify Premium",
      subtitle: "Musique illimitée",
      price: "800F",
      status: "Actif",
      image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=600",
      active: true
    }
  ];

  // ── Calculs dynamiques pour un plan donné ──
  const getPlanStats = (plan: any) => {
    if (!plan) return { price: "0.00", daysLeft: 0, progress: 0, planName: "Abonnement", email: "" };

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
      planName: reviewMode ? "Suivi" : `Netflix ${plan.planNetflix || "Plan"}`,
      email: reviewMode ? (user?.email || "Mon suivi") : (plan.email || "Chargement...")
    };
  };

  const currentStats = getPlanStats(bestPlan);

  // ─── Groupement par échéance (mode review) ────────────────────────────────
  // Répartit les abonnements en 3 sections selon leur date de renouvellement.
  const groupByDueDate = (list: any[]) => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

    const groups: { title: string; items: any[] }[] = [
      { title: 'Ce mois-ci', items: [] },
      { title: 'Mois prochain', items: [] },
      { title: 'Plus tard', items: [] },
    ];

    list.forEach((item) => {
      const expiry = new Date(item.dateExpiration);
      if (expiry <= endOfMonth) groups[0].items.push(item);
      else if (expiry <= endOfNextMonth) groups[1].items.push(item);
      else groups[2].items.push(item);
    });

    return groups.filter((g) => g.items.length > 0);
  };

  // ─── RENDU MODE REVIEW APPLE ──────────────────────────────────────────────
  // App transformée en pur tracker d'abonnements : aucune mention de service
  // tiers, aucun prix, aucun flux de paiement. L'utilisateur ajoute ses
  // abonnements manuellement via le bouton "+".

  // Anti-flash : tant que le mode review n'est pas connu, on affiche un loader
  // neutre au lieu du contenu (évite d'afficher brièvement le mode Netflix).
  if (!ready) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (ready && reviewMode) {
    const grouped = groupByDueDate(activations);
    return (
      <View style={styles.container}>
        <PageHeader variant="blur">
          <View style={styles.headerRow}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image
                source={require("../../assets/logoblanc.png")}
                style={{ width: 36, height: 36, tintColor: '#dc2626' }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#dc2626', letterSpacing: -0.5 }}>
                Moobil<Text style={{ color: '#0f172a' }}>Pay</Text>
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={22} color="#0f172a" />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => router.push('/settings')}
              >
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>
                      {(user?.email?.charAt(0) || 'U').toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </PageHeader>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchActivations(true)} />
          }
        >
          {/* Bouton + Ajouter (juste sous le header) */}
          <TouchableOpacity
            style={styles.addSubBtn}
            activeOpacity={0.85}
            onPress={() => setAddSheetVisible(true)}
          >
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.addSubBtnText}>Ajouter un suivi</Text>
          </TouchableOpacity>

          {/* Liste empilée, groupée par échéance */}
          {grouped.length > 0 ? (
            grouped.map((group) => (
              <View key={group.title} style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>{group.title}</Text>
                {group.items.map((act) => (
                  <SubscriptionCard key={act.id} plan={act} />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.reviewEmpty}>
              <Ionicons name="reader-outline" size={56} color="#e2e8f0" />
              <Text style={styles.reviewEmptyTitle}>Aucun suivi pour le moment</Text>
              <Text style={styles.reviewEmptyText}>
                Appuyez sur « Ajouter un suivi » pour commencer.
              </Text>
            </View>
          )}
        </ScrollView>

        <AddSubscriptionSheet
          visible={addSheetVisible}
          onClose={() => setAddSheetVisible(false)}
          onAdded={() => fetchActivations(true)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader variant="blur">
        <View style={styles.headerRow}>
          {/* Barre de recherche ou Logo */}
          {ready && !reviewMode ? (
            <TouchableOpacity
              style={styles.searchBar}
              activeOpacity={0.7}
              onPress={handleComingSoon}
            >
              <Ionicons name="search-outline" size={20} color="rgba(15,23,42,0.55)" />
              <TextInput
                placeholder="Rechercher..."
                placeholderTextColor="rgba(15,23,42,0.4)"
                style={styles.searchInput}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image
                source={require("../../assets/logoblanc.png")}
                style={{ width: 36, height: 36, tintColor: '#dc2626' }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#dc2626', letterSpacing: -0.5 }}>
                Moobil<Text style={{ color: '#0f172a' }}>Pay</Text>
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#0f172a" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => router.push('/settings')}
            >
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {(user?.email?.charAt(0) || 'U').toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            </View>
          </View>
      </PageHeader>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchActivations(true)} />
        }
      >
        {/* Chips de filtrage */}
        {ready && !reviewMode && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filterSection}
            contentContainerStyle={styles.filterRow}
          >
            {[
              { id: "all", icon: "apps-outline", label: "Tous" },
              { id: "streaming", icon: "play-circle-outline", label: "Streaming" },
              { id: "music", icon: "musical-notes-outline", label: "Musique" },
              { id: "gaming", icon: "game-controller-outline", label: "Gaming" },
              { id: "productivity", icon: "briefcase-outline", label: "Productivité" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
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
        )}

        {/* Section Infos & Compte à rebours (SLIDER) — masquée tant que le mode
            review n'est pas connu (anti-flash) et en review (remplacée par la
            liste empilée SubscriptionCard via l'early-return). */}
        {ready && !reviewMode && (
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
                  <View key={act.id} style={styles.statsCard}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardEmail}>{stats.email}</Text>
                      <Ionicons name="flash-sharp" size={14} color="#dc2626" />
                    </View>

                    <View style={styles.statsHeader}>
                      <Text style={styles.statsPrice}>
                        <Text style={{ fontSize: 18 }}>$</Text>
                        {stats.price}
                      </Text>
                      <Text style={styles.daysCounter}>{stats.daysLeft}</Text>
                    </View>
                    
                    <View style={styles.statsLabels}>
                      <Text style={styles.statsSub}>Jours restants</Text>
                      <Text style={styles.statsSub}>Jours</Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressTrack}>
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
                      <Text style={styles.planLabel}>Plan: {stats.planName}</Text>
                      <Text style={styles.planDuration}>1 mois</Text>
                    </View>

                    {ready && !reviewMode && (
                      <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.resubscribeBtn} onPress={() => router.push('/pay')}>
                          <Ionicons name="flash-sharp" size={16} color="#fff" />
                          <Text style={styles.btnText}>Réabonner</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.unsubscribeBtn} onPress={() => router.push('/pay')}>
                          <Ionicons name="add-circle-outline" size={18} color="#ef4444" />
                          <Text style={styles.btnTextOutline}>Ajouter</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={[styles.statsCard, { opacity: 0.6 }]}>
                <Text style={styles.noPlanMessage}>Aucun plan actif pour le moment</Text>
                {ready && !reviewMode && (
                  <TouchableOpacity style={styles.resubscribeBtn} onPress={() => router.push('/pay')}>
                    <Text style={styles.btnText}>Découvrir les plans</Text>
                  </TouchableOpacity>
                )}
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
        )}

        {/* Sections Services & Découvrir : visibles uniquement hors review et
            une fois le mode review connu (anti-flash). */}
        {ready && !reviewMode && (
        <>
        {/* Séparateur */}
        <View style={styles.subtleSeparator} />

        {/* Section Services & Streaming */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="play-circle" size={24} color="#dc2626" />
            <Text style={styles.sectionTitle}>Services & Streaming</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Gérez vos abonnements et accédez à vos services</Text>
        </View>

        {/* Slider des services & Streaming (Fidèle à l'original) */}
        <View style={styles.servicesSliderWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / (width - 40));
              setActiveServiceIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {staticServices.map((service) => (
              <TouchableOpacity key={service.id} style={styles.serviceSlide} onPress={() => router.push('/pay')}>
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

        {/* Section Découvrir & Divertissement */}
        <View style={styles.discoverSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles" size={24} color="#dc2626" />
              <Text style={styles.sectionTitle}>Découvrir & Divertissement</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Explorez nos services de divertissement et plus encore</Text>
          </View>

          <View style={styles.discoverGrid}>
            <TouchableOpacity style={styles.discoverCard} onPress={() => router.push('/pay')}>
              <LinearGradient colors={["#dc2626", "#ef4444"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="film-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>Cinéma</Text>
                  <Text style={styles.discoverCardDesc}>Films & séries</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.discoverCard} onPress={() => router.push('/pay')}>
              <LinearGradient colors={["#7c3aed", "#a855f7"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="game-controller-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="trophy" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>Gaming</Text>
                  <Text style={styles.discoverCardDesc}>Jeux & consoles</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.discoverCard} onPress={() => router.push('/pay')}>
              <LinearGradient colors={["#059669", "#10b981"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="bag-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="flash" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>Shopping</Text>
                  <Text style={styles.discoverCardDesc}>Achats en ligne</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.discoverCard} onPress={() => router.push('/pay')}>
              <LinearGradient colors={["#ea580c", "#f97316"]} style={styles.cardInternal}>
                <View style={styles.cardHeader}>
                  <Ionicons name="people-outline" size={28} color="#fff" />
                  <View style={styles.cardMiniBadge}>
                    <Ionicons name="heart" size={12} color="#fff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.discoverCardTitle}>Social</Text>
                  <Text style={styles.discoverCardDesc}>Réseaux sociaux</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        </>
        )}

        {/* Séparateur */}
        <View style={styles.subtleSeparator} />

        {/* Actions rapides (en dernier) */}
        {ready && !reviewMode && (
          <View style={styles.actionsGrid}>
            {[
              { id: "accounts", icon: "people-outline", label: "Comptes" },
              { id: "help", icon: "help-circle-outline", label: "Aide" },
              { id: "news", icon: "film-outline", label: "Actus film" },
              { id: "share", icon: "share-social-outline", label: "Partager" },
            ].map((item) => (
              <TouchableOpacity key={item.id} style={styles.actionCard} onPress={handleComingSoon}>
                <View style={styles.actionCardIcon}>
                  <Ionicons name={item.icon as any} size={22} color="#dc2626" />
                </View>
                <Text style={styles.actionCardLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef0f4",
  },
  // ── Mode review : bouton + et liste empilée ──
  addSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    marginHorizontal: 20,
    height: 52,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  addSubBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  reviewSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  reviewSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  reviewEmpty: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  reviewEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
  },
  reviewEmptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#0f172a',
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
    backgroundColor: 'rgba(15,23,42,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: '#fff',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0,
    borderColor: 'rgba(15,23,42,0.12)',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    overflow:'hidden'
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,

        // backgroundColor: 'hsla(210, 40%, 98%, 1.00)',
    // backgroundColor: '#eef0f4',
        backgroundColor: 'hsla(210, 40%, 97%, 1.00)',
  },
  filterSection: {
    marginTop: 8,
    marginBottom: 24,
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
    width: width - 40,
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
    marginTop: 20,
    opacity: 0.5,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 36,
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
  },
  serviceSlide: {
    width: width - 40,
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
    marginTop: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 40) / 4 - 8,
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
    // Le marginTop est porté par sectionHeader pour un rythme cohérent
  },
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  discoverCard: {
    width: (width - 40) / 2 - 6,
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

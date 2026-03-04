import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/features/auth/context/AuthContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { userData, user } = useAuth();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const stats = {
    price: "12.99",
    daysLeft: 14,
    progress: 45,
    planName: "Netflix Premium",
  };

  return (
    <View style={styles.container}>
      {/* ─── CUSTOM HOME HEADER ─── */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#230f0f", "#2e1a1a", "#3e1616"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBg}
        />
        <SafeAreaView style={styles.headerInner}>
          <View style={styles.headerRow}>
            {/* Barre de recherche */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                placeholder="Rechercher..."
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
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Chips de filtrage */}
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

        {/* Section Infos & Compte à rebours */}
        <View style={styles.statsCard}>
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

          {/* Barre de progression custom */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={["#dc2626", "#ef4444", "#f87171"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${stats.progress}%` }]}
              />
              <TouchableOpacity 
                style={[styles.progressIndicator, { left: `${stats.progress}%` }]}
                activeOpacity={0.8}
              >
                <View style={styles.indicatorDot} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.planInfo}>
            <Text style={styles.planLabel}>Plan: {stats.planName}</Text>
            <Text style={styles.planDuration}>1 mois</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.resubscribeBtn}
              onPress={() => router.push('/pay')}
            >
              <Ionicons name="flash-sharp" size={16} color="#fff" />
              <Text style={styles.btnText}>Réabonner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.unsubscribeBtn}>
              <Ionicons name="flash-off-sharp" size={16} color="#ef4444" />
              <Text style={styles.btnTextOutline}>Désabonner</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {/* Slider des services (Simplified for mobile) */}
        <View style={styles.sliderContainer}>
          <TouchableOpacity style={styles.serviceSlide}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1574375927938-d5a98e84875a?q=80&w=400" }} // Netflix placeholder
              style={styles.slideImage}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.slideOverlay}
            >
              <Text style={styles.slideTitle}>Netflix Premium</Text>
              <Text style={styles.slideSubtitleText}>Compte partagé • 4 écrans</Text>
              <View style={styles.slideBadges}>
                <Text style={styles.priceBadge}>2000F</Text>
                <Text style={[styles.statusBadge, styles.statusBadgeActive]}>Actif</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsGrid}>
          {[
            { id: "accounts", icon: "people-outline", label: "Comptes" },
            { id: "help", icon: "help-circle-outline", label: "Aide" },
            { id: "news", icon: "film-outline", label: "Actus film" },
            { id: "share", icon: "share-social-outline", label: "Partager" },
          ].map((item) => (
            <TouchableOpacity key={item.id} style={styles.actionCard}>
              <View style={styles.actionCardIcon}>
                <Ionicons name={item.icon as any} size={22} color="#dc2626" />
              </View>
              <Text style={styles.actionCardLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Séparateur */}
        <View style={styles.subtleSeparator} />

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
            <TouchableOpacity style={styles.discoverCard}>
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

            <TouchableOpacity style={styles.discoverCard}>
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

            <TouchableOpacity style={styles.discoverCard}>
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

            <TouchableOpacity style={styles.discoverCard}>
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
      </ScrollView>

      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    height: 125,
    position: 'relative',
    zIndex: 10,
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
  },
  headerInner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 16,
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
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
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
  sliderContainer: {
    paddingHorizontal: 20,
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
  slideTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  slideSubtitleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  slideBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  priceBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.9)',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#dc2626',
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginTop: 20,
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
    marginTop: 10,
    marginBottom: 20,
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

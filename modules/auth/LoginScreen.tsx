import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleGoogleSignIn } from "../../src/features/auth/services/googleAuthService";
import { AppLoader } from "../../src/components/AppLoader";

const { width, height } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const heroBounce = useRef(new Animated.Value(-20)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(80)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(heroBounce, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 55, friction: 12, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogle = async () => {
    setAuthLoading(true);
    const result = await handleGoogleSignIn();
    setAuthLoading(false);

    if (!result.success && result.error && result.error !== "Connexion annulée") {
      Alert.alert("Erreur de connexion", result.error);
    }
  };

  const AuthButton = ({
    icon,
    label,
    onPress,
    googleStyle = false,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    googleStyle?: boolean;
  }) => (
    <TouchableOpacity style={styles.authBtn} onPress={onPress} activeOpacity={0.72}>
      <View style={styles.authBtnIcon}>{icon}</View>
      <Text style={styles.authBtnLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <AppLoader visible={authLoading} message="Connexion Google..." />
      
      {/* ─── FOND ─── */}
      <LinearGradient
        colors={["#0a0a12", "#0f0f1a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Accent géométrique — arc rouge qui saigne hors du coin */}
      <View style={[styles.arcContainer, { top: -height * 0.12 + insets.top }]}>
        <View style={styles.arc} />
      </View>

      {/* Grain texture overlay — lignes diagonales épurées */}
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.diagonalLine,
            { top: i * 62, opacity: 0.025 },
          ]}
        />
      ))}

      {/* ─── ZONE HERO ─── */}
      <Animated.View
        style={[
          styles.hero,
          {
            paddingTop: insets.top + 32,
            opacity: heroOpacity,
            transform: [{ translateY: heroBounce }],
          },
        ]}
      >
        {/* Logo mark — ancré haut gauche */}
        <View style={styles.logoPill}>
          <LinearGradient
            colors={["#c41a1a", "#7c0d0d"]}
            style={styles.logoPillGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="phone-portrait-outline" size={16} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoPillName}>MoobilPay</Text>
        </View>

        {/* Titre héro — typographie dominante */}
        <View style={styles.heroTitle}>
          <Text style={styles.heroLine1}>Payez votre</Text>
          <View style={styles.heroAccentRow}>
            <Text style={styles.heroLine2}>Netflix</Text>
            <View style={styles.heroRedUnderline} />
          </View>
          <Text style={styles.heroLine3}>depuis l'Afrique.</Text>
        </View>

        {/* Badges paiement — ancrés bas de la zone héro */}
        <View style={styles.partnerBadges}>
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: "#ffcc00" }]} />
            <Text style={styles.badgeLabel}>MTN Money</Text>
          </View>
          <View style={styles.badgeSep} />
          <View style={styles.badge}>
            <View style={[styles.badgeDot, { backgroundColor: "#ff6600" }]} />
            <Text style={styles.badgeLabel}>Orange Money</Text>
          </View>
        </View>
      </Animated.View>

      {/* ─── CARTE AUTH ─── */}
      <Animated.View
        style={[
          styles.authCard,
          {
            paddingBottom: insets.bottom + 24,
            opacity: cardOpacity,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        {/* Handle visuel */}
        <View style={styles.handle} />

        <Text style={styles.authCardTitle}>Se connecter</Text>
        <Text style={styles.authCardSub}>Choisissez une méthode</Text>

        {/* ── GRILLE 2×2 — méthodes sociales ── */}
        <View style={styles.socialGrid}>
          <TouchableOpacity 
            style={styles.socialCell} 
            activeOpacity={0.72}
            onPress={handleGoogle}
            disabled={authLoading}
          >
            <View style={styles.socialIcon}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.socialLabel}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialCell} activeOpacity={0.72}>
            <View style={styles.socialIcon}>
              <Ionicons name="logo-apple" size={22} color="#fff" />
            </View>
            <Text style={styles.socialLabel}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* ── BOUTONS EMAIL + SMS ── */}
        <View style={styles.altMethods}>
          <TouchableOpacity style={styles.altBtn} activeOpacity={0.75}>
            <Ionicons name="mail-outline" size={17} color="rgba(255,255,255,0.55)" />
            <Text style={styles.altBtnText}>Continuer avec Email</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
          </TouchableOpacity>

          <View style={styles.altDivider} />

          <TouchableOpacity style={styles.altBtn} activeOpacity={0.75}>
            <Ionicons name="chatbubble-outline" size={17} color="rgba(255,255,255,0.55)" />
            <Text style={styles.altBtnText}>Continuer avec SMS</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
          </TouchableOpacity>
        </View>

        {/* Légal */}
        <Text style={styles.legal}>
          En continuant, vous acceptez nos{" "}
          <Text style={styles.legalLink}>Conditions</Text>
          {" "}et notre{" "}
          <Text style={styles.legalLink}>Politique de confidentialité</Text>
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },

  // Arc décoratif
  arcContainer: {
    position: "absolute",
    right: -width * 0.35,
    zIndex: 0,
  },
  arc: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    borderWidth: 1,
    borderColor: "rgba(196, 26, 26, 0.18)",
    backgroundColor: "rgba(196, 26, 26, 0.06)",
  },

  // Lignes diagonales
  diagonalLine: {
    position: "absolute",
    left: -40,
    right: -40,
    height: 1,
    backgroundColor: "#fff",
    transform: [{ rotate: "-22deg" }],
  },

  // ─── HÉRO ───
  hero: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    zIndex: 2,
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
  },
  logoPillGrad: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPillName: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.3,
  },

  // Titre héro
  heroTitle: {
    marginTop: 28,
  },
  heroLine1: {
    fontSize: 38,
    fontWeight: "300",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: -0.5,
    lineHeight: 46,
  },
  heroAccentRow: {
    flexDirection: "column",
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  heroLine2: {
    fontSize: 58,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1.5,
    lineHeight: 62,
  },
  heroRedUnderline: {
    height: 3,
    width: 80,
    backgroundColor: "#c41a1a",
    borderRadius: 2,
    marginTop: 2,
  },
  heroLine3: {
    fontSize: 38,
    fontWeight: "300",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: -0.5,
    lineHeight: 46,
  },

  // Badges partenaires
  partnerBadges: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.38)",
    fontWeight: "500",
  },
  badgeSep: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 14,
  },

  // ─── CARTE AUTH ───
  authCard: {
    backgroundColor: "#13131f",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    zIndex: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center",
    marginBottom: 24,
  },
  authCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 3,
  },
  authCardSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.32)",
    marginBottom: 22,
  },

  // Grille 2×2 sociale
  socialGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  socialCell: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  socialLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
  },

  // Méthodes alternatives (Email + SMS)
  altMethods: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    marginBottom: 20,
  },
  altBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  altBtnText: {
    flex: 1,
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    fontWeight: "500",
  },
  altDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 16,
  },

  // Légal
  legal: {
    fontSize: 11,
    color: "rgba(255,255,255,0.18)",
    textAlign: "center",
    lineHeight: 17,
  },
  legalLink: {
    color: "rgba(196, 26, 26, 0.55)",
    fontWeight: "600",
  },

  authBtn: {},
  authBtnIcon: {},
  authBtnLabel: {},
});

export default LoginScreen;

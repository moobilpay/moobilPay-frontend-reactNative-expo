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
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleGoogleSignIn } from "../../src/features/auth/services/googleAuthService";
import { handleEmailAuth } from "../../src/features/auth/services/emailAuthService";
import { AppLoader } from "../../src/components/AppLoader";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const heroBounce = useRef(new Animated.Value(-20)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(80)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // États pour l'authentification e-mail
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
  const [loadingMessage, setLoadingMessage] = useState("Veuillez patienter...");

  const handleGoogle = async () => {
    setLoadingMessage("Connexion Google...");
    setAuthLoading(true);
    const result = await handleGoogleSignIn();
    setAuthLoading(false);

    if (result.success) {
      router.push('/(tabs)');
    } else if (result.error && result.error !== "Connexion annulée") {
      Alert.alert("Erreur de connexion", result.error);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Champs requis", "Veuillez remplir l'e-mail et le mot de passe.");
      return;
    }

    setLoadingMessage("Authentification...");
    setAuthLoading(true);
    const result = await handleEmailAuth(email, password);
    setAuthLoading(false);

    if (result.success) {
      router.push('/(tabs)');
    } else if (result.error) {
      Alert.alert("Erreur d'authentification", result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.root} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <AppLoader visible={authLoading} message={loadingMessage} />
      
      <LinearGradient
        colors={["#0a0a12", "#0f0f1a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Accent géométrique */}
      <View style={[styles.arcContainer, { top: -height * 0.12 + insets.top }]}>
        <View style={styles.arc} />
      </View>

      {/* Rendu dynamique : Si e-mail mode, on cache le hero pour plus de place */}
      {!isEmailMode && (
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

          <View style={styles.heroTitle}>
            <Text style={styles.heroLine1}>Payez votre</Text>
            <View style={styles.heroAccentRow}>
              <Text style={styles.heroLine2}>Netflix</Text>
              <View style={styles.heroRedUnderline} />
            </View>
            <Text style={styles.heroLine3}>depuis l'Afrique.</Text>
          </View>

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
      )}

      {/* ─── CARTE AUTH ─── */}
      <Animated.View
        style={[
          styles.authCard,
          isEmailMode && styles.authCardExpanded,
          {
            paddingBottom: insets.bottom + (isEmailMode ? 40 : 24),
            opacity: cardOpacity,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <View style={styles.handle} />

        {/* ── MODE E-MAIL ── */}
        {isEmailMode ? (
          <View style={styles.emailForm}>
            <View style={styles.formHeader}>
              <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => setIsEmailMode(false)}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.authCardTitle}>Accès E-mail</Text>
            </View>
            <Text style={styles.authCardSub}>Connectez-vous ou créez un compte</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Adresse e-mail"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Mot de passe"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              activeOpacity={0.8}
              onPress={handleEmailSubmit}
            >
              <Text style={styles.submitBtnText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          /* ── MODE CHOIX MÉTHODE ── */
          <>
            <Text style={styles.authCardTitle}>Se connecter</Text>
            <Text style={styles.authCardSub}>Choisissez une méthode</Text>

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

            <View style={styles.altMethods}>
              <TouchableOpacity 
                style={styles.altBtn} 
                activeOpacity={0.75}
                onPress={() => setIsEmailMode(true)}
              >
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
          </>
        )}

        {/* Légal */}
        <Text style={styles.legal}>
          En continuant, vous acceptez nos{" "}
          <Text style={styles.legalLink}>Conditions</Text>
          {" "}et notre{" "}
          <Text style={styles.legalLink}>Politique de confidentialité</Text>
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
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

  // Styles E-mail Mode
  authCardExpanded: {
    paddingTop: 24,
  },
  emailForm: {
    width: "100%",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c41a1a",
    borderRadius: 14,
    height: 56,
    marginTop: 24,
    gap: 10,
    shadowColor: "#c41a1a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default LoginScreen;

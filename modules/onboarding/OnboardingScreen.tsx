import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReviewMode } from "../../src/context/ReviewModeContext";

const { width, height } = Dimensions.get("window");

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeAnim] = useState(new Animated.Value(1));
  const insets = useSafeAreaInsets();
  const { reviewMode, ready } = useReviewMode();
  const totalSteps = 3;

  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      animateTransition();
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      animateTransition();
      setTimeout(() => setCurrentStep(currentStep - 1), 300);
    }
  };

  const skipOnboarding = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    onComplete();
  };

  const goToStep = (step: number) => {
    if (step !== currentStep) {
      animateTransition();
      setTimeout(() => setCurrentStep(step), 300);
    }
  };

  const renderIllustration = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.streamingScene}>
          <View style={styles.netflixCard}>
            <Text style={styles.netflixLogo}>N</Text>
            <View style={styles.playButton}>
              <Text style={styles.playText}>▶</Text>
            </View>
          </View>
          <View style={styles.floatingIcons}>
            <Ionicons
              name="play-circle"
              style={[styles.floatingIcon, { top: 10, left: 10 }]}
            />
            <Ionicons
              name="film-outline"
              style={[styles.floatingIcon, { top: 20, right: 5 }]}
            />
            <Ionicons
              name="tv-outline"
              style={[styles.floatingIcon, { bottom: 15, left: 20 }]}
            />
          </View>
        </View>
      );
    } else if (currentStep === 2) {
      return (
        <View style={styles.paymentScene}>
          <View style={styles.paymentCards}>
            <View style={[styles.paymentCard, styles.mtn]}>
              <Text style={styles.cardLogo}>{reviewMode ? "Budget" : "MTN"}</Text>
              <Text style={styles.cardSignal}>{reviewMode ? "📊" : "📶"}</Text>
            </View>
            <View style={[styles.paymentCard, styles.orange]}>
              <Text style={styles.cardLogo}>{reviewMode ? "Suivi" : "Orange"}</Text>
              <Text style={styles.cardSignal}>{reviewMode ? "🔔" : "📱"}</Text>
            </View>
          </View>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" style={styles.securityIcon} />
          </View>
        </View>
      );
    } else if (currentStep === 3) {
      return (
        <View style={styles.successScene}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" style={styles.successCheck} />
          </View>
          <View style={styles.streamingDevices}>
            <Text style={[styles.device, styles.phone]}>📱</Text>
            <Text style={[styles.device, styles.laptop]}>💻</Text>
            <Text style={[styles.device, styles.tv]}>📺</Text>
          </View>
          <View style={styles.successWaves}>
            <View style={styles.wave} />
            <View style={styles.wave} />
            <View style={styles.wave} />
          </View>
        </View>
      );
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsIndicator}>
        {[1, 2, 3].map((step) => (
          <TouchableOpacity key={step} onPress={() => goToStep(step)}>
            <View
              style={[styles.dot, currentStep === step && styles.activeDot]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Anti-flash : tant que le mode review n'est pas connu (API pas répondue),
  // on affiche un écran de chargement neutre sur le même fond. Évite d'afficher
  // brièvement le contenu "Netflix" avant de basculer en review.
  if (!ready) {
    return (
      <View style={[styles.onboardingContent, { alignItems: 'center', justifyContent: 'center' }]}>
        <LinearGradient
          colors={["#0f0f23", "#1a1a2e", "#16213e"]}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <View style={styles.onboardingContent}>
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e", "#16213e"]}
        style={styles.gradient}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <View style={[styles.onboardingContainer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.onboardingHeader}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(currentStep / totalSteps) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep} / {totalSteps}
              </Text>
            </View>
            <TouchableOpacity
              onPress={skipOnboarding}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepsContainer}>
            <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
              <View style={styles.stepIllustration}>
                {renderIllustration()}
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>
                  {currentStep === 1
                    ? "Bienvenue sur MoobilPay"
                    : currentStep === 2
                      ? (reviewMode ? "Tout au même endroit" : "Paiements Sécurisés")
                      : (reviewMode ? "Rappels intelligents" : "Activation Instantanée")}
                </Text>
                <Text style={styles.stepSubtitle}>
                  {currentStep === 1
                    ? (reviewMode ? "Gardez vos suivis" : "Votre passerelle vers Netflix")
                    : currentStep === 2
                      ? (reviewMode ? "Une vue claire de votre budget" : "MTN & Orange Money")
                      : (reviewMode ? "Ne ratez plus une échéance" : "Netflix prêt en 2 minutes")}
                </Text>
                <Text style={styles.stepDescription}>
                  {currentStep === 1
                    ? (reviewMode
                        ? "Suivez et organisez tous vos suivis personnels en un seul endroit, simplement."
                        : "Accédez instantanément à des milliers de films et séries. Payez votre abonnement Netflix en quelques clics avec MTN ou Orange Money.")
                    : currentStep === 2
                      ? (reviewMode
                          ? "Visualisez vos dépenses récurrentes et gardez le contrôle de votre budget mensuel."
                          : "Utilisez votre compte MTN Money ou Orange Money pour payer en toute sécurité. Vos données sont protégées et vos transactions cryptées.")
                      : (reviewMode
                          ? "Recevez des rappels personnalisés avant chaque échéance pour mieux planifier."
                          : "Votre compte Netflix est activé immédiatement après le paiement. Profitez de vos films et séries sur tous vos appareils !")}
                </Text>
              </View>
            </Animated.View>
            {renderDots()}
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={prevStep}
              disabled={currentStep === 1}
              style={[
                styles.navButton,
                styles.prevButton,
                currentStep === 1 && styles.disabled,
              ]}
            >
              <Ionicons
                name="chevron-back-outline"
                size={20}
                color={currentStep === 1 ? "#666" : "rgba(255, 255, 255, 0.7)"}
              />
              <Text
                style={[
                  styles.navText,
                  currentStep === 1 && styles.disabledText,
                ]}
              >
                Précédent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={nextStep}
              style={[styles.navButton, styles.nextButton]}
            >
              <Text style={styles.nextText}>
                {currentStep === totalSteps ? "Let's go" : "Suivant"}
              </Text>
              <Ionicons
                name={
                  currentStep === totalSteps
                    ? "rocket-outline"
                    : "chevron-forward-outline"
                }
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  onboardingContent: {
    flex: 1,
    position: "relative",
    backgroundColor: "#0f0f23",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  onboardingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    zIndex: 1,
  },
  onboardingHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  progressText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  skipButton: {},
  skipText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  stepsContainer: {
    // flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  stepContent: {
    width: "100%",
    opacity: 1,
  },
  stepText: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  stepIllustration: {
    marginBottom: 40,
  },
  streamingScene: {
    position: "relative",
    width: 150,
    height: 150,
    marginHorizontal: "auto",
  },
  netflixCard: {
    width: 120,
    height: 80,
    backgroundColor: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginHorizontal: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    elevation: 35,
    borderWidth: 2,
    borderColor: "rgba(220, 38, 38, 0.3)",
  },
  netflixLogo: {
    color: "#dc2626",
    fontSize: 32,
    fontWeight: "900",
  },
  playButton: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    backgroundColor: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    borderRadius: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  playText: {
    color: "white",
    fontSize: 12,
  },
  floatingIcons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingIcon: {
    position: "absolute",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 20,
  },
  paymentScene: {
    position: "relative",
    width: 150,
    height: 150,
    marginHorizontal: "auto",
  },
  paymentCards: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 20,
  },
  paymentCard: {
    width: 60,
    height: 40,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  mtn: {
    backgroundColor: "linear-gradient(135deg, #ffcc00 0%, #ff9900 100%)",
  },
  orange: {
    backgroundColor: "linear-gradient(135deg, #ff6600 0%, #ff3300 100%)",
  },
  cardLogo: {
    fontSize: 10,
    fontWeight: "900",
    color: "white",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSignal: {
    fontSize: 12,
    marginTop: 2,
  },
  securityBadge: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -20 }],
    width: 40,
    height: 40,
    backgroundColor: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    borderRadius: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  securityIcon: {
    color: "white",
    fontSize: 20,
  },
  successScene: {
    position: "relative",
    width: 150,
    height: 150,
    marginHorizontal: "auto",
  },
  successCircle: {
    width: 80,
    height: 80,
    backgroundColor: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    borderRadius: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 30,
  },
  successCheck: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  streamingDevices: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  device: {
    fontSize: 20,
  },
  phone: {},
  laptop: {},
  tv: {},
  successWaves: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  wave: {
    position: "absolute",
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "rgba(34, 197, 94, 0.3)",
    borderRadius: 50,
  },
  stepTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 32,
  },
  stepSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
  },
  stepDescription: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    lineHeight: 24,
    marginHorizontal: "auto",
    maxWidth: 300,
    textAlign: "center",
  },
  dotsIndicator: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 30,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    cursor: "pointer",
  },
  activeDot: {
    backgroundColor: "#fff",
    transform: [{ scaleX: 1.2 }],
  },
  navigationButtons: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 20,
  },
  navButton: {
    borderRadius: 12,
    height: 50,
    fontWeight: "600",
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  prevButton: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: undefined,
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
  },
  navText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#666",
  },
  nextText: {
    color: "#fff",
  },
});

export default OnboardingScreen;

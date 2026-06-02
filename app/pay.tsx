/**
 * pay.tsx — Reabonnement Screen (Orchestrateur)
 *
 * Flux EXACT du frontend Angular (payement.component.ts + PaymentModalService) :
 * ───────────────────────────────────────────────────────────────────────────────
 * Page 1   → Choix du plan
 * Page 1.5 → Identité Netflix (Prénom/Nom → API credentials)  → page 2 step 1
 * Page 2 step 1 → Choix de méthode
 * Page 2 step 2 → Formulaire de détails
 *   • Mobile Money (OM/MTN)  :
 *       a. Clic "Payer" → paymentModal.startInitializing() → BOTTOM SHEET S'OUVRE (isInitializing=true)
 *       b. POST init-mobile-money → réponse : { paymentLink, transactionId, planActivationId }
 *       c. paymentModal.openModal(link, txId) → isInitializing=false + DISPLAY_TIME 6s loader
 *       d. WebView charge la passerelle Yuunna
 *       e. Socket "payment_validated" → bottom sheet fermé → page 5
 *       f. Fermeture manuelle (bouton Fermer / backdrop) → isCancelling=true → POST cancel → fermeture
 *   • Carte bancaire : formulaire dans l'app → page 5
 *   • PayPal : redirect → page 5
 * Page 5 → Spinner activation (attente socket "activationcreated")
 * Page 6 → Reçu de succès
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// import { io, Socket } from 'socket.io-client'; // Supprimé
import axios from 'axios';
import { usePaymentSocket } from '../src/features/payment/hooks/usePaymentSocket';

import { PageHeader } from '../src/components/PageHeader';
import { AppLoader } from '../src/components/AppLoader';
import { useAuth } from '../src/features/auth/context/AuthContext';
import { Config } from '../src/api/config';
import { NetflixPlan, PaymentMethod } from '../src/features/payment/types';

// Composants d'étapes
import StepPlanSelection from '../src/features/payment/components/StepPlanSelection';
import StepNetflixInfo from '../src/features/payment/components/StepNetflixInfo';
import StepPaymentMethod from '../src/features/payment/components/StepPaymentMethod';
import StepPaymentDetails from '../src/features/payment/components/StepPaymentDetails';
import StepProcessing from '../src/features/payment/components/StepProcessing';
import StepReceipt from '../src/features/payment/components/StepReceipt';

// Bottom Sheet de paiement (réplique du ion-modal 80%)
import PaymentBottomSheet from '../src/features/payment/components/PaymentBottomSheet';

// ─── Constantes ──────────────────────────────────────────────────────────────
const STEP_LABELS = ['Plan', 'Netflix', 'Méthode', 'Détails', 'Confir.', 'Reçu'];
const DISPLAY_TIME = 6000; // Durée d'affichage de l'overlay initialisation (même que frontend)

function getStepNumber(page: number, activeStep: number): number {
  if (page === 1) return 1;
  if (page === 1.5) return 2;
  if (page === 2 && activeStep === 1) return 3;
  if (page === 2 && activeStep === 2) return 4;
  if (page === 5) return 5;
  if (page === 6) return 6;
  return 1;
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function ReabonnementScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  // const socketRef = useRef<Socket | null>(null); // Supprimé

  // ── Navigation ──
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeStep, setActiveStep] = useState(1);

  // ── Plans ──
  const [plans, setPlans] = useState<NetflixPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('premium');

  // ── Identité Netflix ──
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [netflixEmail, setNetflixEmail] = useState('');
  const [netflixPassword, setNetflixPassword] = useState('');

  // ── Méthode de paiement ──
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // ── Formulaire détails ──
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // ── Résultats paiement ──
  const [transactionId, setTransactionId] = useState('');
  const [planActivationId, setPlanActivationId] = useState('');

  // ── Activation ──
  const [verificationStep, setVerificationStep] = useState(0);

  // ── Mode review Apple (servi par le backend au GET des plans) ──
  // Quand true, on court-circuite tout le flux de paiement.
  const [appleReviewMode, setAppleReviewMode] = useState(false);

  // Refs pour les listeners socket (évite de dépendre des états dans le useEffect)
  const currentPageRef = useRef(currentPage);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  // ── État du bottom sheet (calqué sur PaymentModalService) ──
  const [showPaymentModal, setShowPaymentModal] = useState(false);  // isOpen
  const [paymentUrl, setPaymentUrl] = useState('');                  // paymentUrl
  const [isInitializing, setIsInitializing] = useState(false);       // isInitializing
  const [isCancelling, setIsCancelling] = useState(false);           // isCancelling
  const [frameLoaded, setFrameLoaded] = useState(false);            // paymentFrameLoaded
  const [isInstantClose, setIsInstantClose] = useState(false);      // instantClose

  const [isLoading, setIsLoading] = useState(false);
  const [recoveryTrigger, setRecoveryTrigger] = useState(0);

  // ─── Récupération au retour du background ──────────────────────────────
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 [APP-STATE] Retour au premier plan ! Réveil du Turbo...');
        setRecoveryTrigger(prev => prev + 1);

        // En plus du re-scan WebView, on demande la vérité à notre backend
        // (qui interroge Digikuntz). Permet de capter l'annulation faite dans
        // l'app Orange/MTN même si la WebView Flutterwave est devenue inutilisable.
        if (transactionId && showPaymentModal && !isCancelling) {
          (async () => {
            try {
              const res = await axios.get(`${Config.apiUrl}/api/payment/status/${transactionId}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' },
              });
              const realStatus = res.data?.status;
              console.log(`🔍 [RESUME-STATUS-CHECK] Digikuntz dit: ${realStatus} (raw=${res.data?.rawStatus})`);
              if (realStatus === 'failed' || realStatus === 'cancelled') {
                console.log('❌ [RESUME-STATUS-CHECK] Annulation/échec confirmé côté provider, fermeture modale.');
                cancelPayment();
              } else if (realStatus === 'success') {
                console.log('✅ [RESUME-STATUS-CHECK] Succès confirmé côté provider.');
                // Le socket payment_validated devrait déjà arriver via le polling/webhook,
                // mais on peut anticiper la fermeture si pas encore reçue.
              }
            } catch (e: any) {
              console.warn('⚠️ [RESUME-STATUS-CHECK] Erreur:', e?.message);
            }
          })();
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [transactionId, showPaymentModal, isCancelling]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const stepNumber = getStepNumber(currentPage, activeStep);
  const stepperProgress = (stepNumber / 6) * 100;

  // ─── Initialisation ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchPlans();
    if (userData) {
      setUserFirstName((prev) => prev || userData.infos?.prenom || user?.displayName?.split(' ')[0] || '');
      setUserLastName((prev) => prev || userData.infos?.nom || user?.displayName?.split(' ')[1] || '');
    }
  }, [userData, user]);

  // ON NE GÈRE PLUS LE SOCKET ICI, C'EST DÉPORTÉ DANS LE HOOK CI-DESSOUS


  // ─── Plans ───────────────────────────────────────────────────────────────
  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${Config.apiUrl}/api/netflix/plans`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (res.data.success && res.data.data?.length > 0) {
        setPlans(res.data.data);
        const premium = res.data.data.find((p: NetflixPlan) => p.id === 'premium');
        setSelectedPlanId(premium?.id || res.data.data[0].id);
      }
      // Mode review : court-circuite tout le flux de paiement par la suite.
      setAppleReviewMode(res.data.appleReviewMode === true);
    } catch (err) {
      console.error('[pay] fetchPlans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  // ─── Reset complet de l'état (Action Home) ────────────────────────────────
  const handleHome = () => {
    // 1. Reset navigation
    setCurrentPage(1);
    setActiveStep(1);
    
    // 2. Reset données Netflix
    setNetflixEmail('');
    setNetflixPassword('');
    
    // 3. Reset sélection méthode et formulaires
    setSelectedMethod(null);
    setPhoneNumber('');
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    
    // 4. Reset transactions
    setTransactionId('');
    setPlanActivationId('');
    setVerificationStep(0);
    
    // 5. Reset UI
    setIsLoading(false);
    resetModal();

    // 6. Navigation
    router.replace('/(tabs)/');
  };

  // ─── Socket (Nouvelle Architecture) ──────────────────────────────────────
  usePaymentSocket({
    onPaymentValidated: (data) => {
      console.log('💰 [SOCKET-EVENT] payment_validated REÇU !');
      const incomingId = data.data?.userId ? String(data.data.userId).trim() : null;
      const currentUid = user?.uid ? String(user.uid).trim() : null;
      const currentDbId = userData?.id ? String(userData.id).trim() : null;

      if (data.success && (incomingId === currentUid || (currentDbId && incomingId === currentDbId))) {
        if (currentPageRef.current < 5) {
          closeModalOnSuccess();
          setVerificationStep(2);
          setCurrentPage(5);
        }
      }
    },
    onActivationCreated: (data) => {
      console.log('🚀 [SOCKET-EVENT] activationcreated REÇU !');
      if (data.success && currentPageRef.current < 6) {
        closeModalOnSuccess();
        setVerificationStep(4);
        setTimeout(() => {
          setCurrentPage(6);
        }, 3500);
      }
    }
  });

  // ─── PaymentModalService — startInitializing() ────────────────────────────
  // Appelé avant l'API → ouvre le bottom sheet en état "initializing"
  const startInitializing = () => {
    resetModal();
    setIsInitializing(true);
    setShowPaymentModal(true);
  };

  // ─── PaymentModalService — openModal(link, txId) ──────────────────────────
  // Appelé après réception de l'URL → affiche le loader 6s puis la webview
  const openModal = (link: string, txId: string) => {
    setFrameLoaded(false);
    setTransactionId(txId);
    setPaymentUrl(link);
    setShowPaymentModal(true);

    // Overlay de chargement visible pendant DISPLAY_TIME (même que frontend)
    setTimeout(() => {
      setIsInitializing(false);
    }, DISPLAY_TIME);
  };

  // ─── PaymentModalService — closeModal() ───────────────────────────────────
  // Appelé par le bouton Fermer ou le backdrop
  const closePaymentModal = () => {
    if (verificationStep === 2) {
      // Paiement déjà validé → simple fermeture
      setShowPaymentModal(false);
      return;
    }
    // Sinon → annulation avec requête backend
    cancelPayment();
  };

  // ─── PaymentModalService — cancelPayment() ───────────────────────────────
  const cancelPayment = async () => {
    setIsCancelling(true);
    const startTime = Date.now();
    const MIN_DISPLAY = 2000; // 2s minimum d'affichage "Annulation..."

    const doFinalize = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DISPLAY - elapsed);
      setTimeout(finalizeCancellation, remaining);
    };

    if (transactionId) {
      try {
        const idToken = await user?.getIdToken();
        await axios.post(
          `${Config.apiUrl}/api/subscription/cancel`,
          { transactionId },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        console.log('[pay] Annulation confirmée');
      } catch (err) {
        console.error('[pay] Erreur annulation (ignorée):', err);
      }
    }
    doFinalize();
  };

  // ─── Finaliser la fermeture (reset complet) ───────────────────────────────
  const finalizeCancellation = () => {
    setIsCancelling(false);
    setShowPaymentModal(false);
    setPaymentUrl('');
    setFrameLoaded(false);
    setTransactionId('');
    setVerificationStep(0);
  };

  // ─── Fermeture après SUCCÈS (conserve les données de transaction) ──────────
  const closeModalOnSuccess = () => {
    console.log('🏁 [MODAL-ACTION] Exécution de closeModalOnSuccess (Fermeture UI)');
    setIsCancelling(false);
    setIsInitializing(false);
    setIsInstantClose(true); // Fermeture instantanée
    setShowPaymentModal(false); 
    setPaymentUrl('');
    setFrameLoaded(false);
    console.log('🏁 [MODAL-ACTION] Modal fermé avec succès.');
  };

  const resetModal = () => {
    setShowPaymentModal(false);
    setPaymentUrl('');
    setFrameLoaded(false);
    setIsCancelling(false);
    setIsInstantClose(false);
  };

  // ─── Formatage téléphone ──────────────────────────────────────────────────
  const formatPhone = (phone: string) => {
    let clean = phone.replace(/\s/g, '');
    if (clean.startsWith('+237')) clean = clean.substring(4);
    else if (clean.startsWith('237')) clean = clean.substring(3);
    return `+237${clean}`;
  };

  // ─── Étape 1 → 1.5 ───────────────────────────────────────────────────────
  const handlePlanContinue = () => {
    // Mode review Apple : on saute TOUT le flux (Netflix, méthode, détails,
    // webview, traitement) et on va directement à l'étape Reçu (page 6).
    if (appleReviewMode) {
      handleReviewSkip();
      return;
    }
    setCurrentPage(1.5);
  };

  // ─── Mode review : court-circuit direct vers le Reçu ─────────────────────
  // Réutilise le même mécanisme que le skip webview : le backend (APPLE_REVIEW_MODE)
  // crée l'activation + transaction factice via init-mobile-money (skipPayment),
  // puis on lance subscription/init et on affiche le Reçu sans aucun écran de paiement.
  const handleReviewSkip = async () => {
    setIsLoading(true);
    try {
      const idToken = await user?.getIdToken();
      // En mode review, l'utilisateur n'a pas saisi ses identifiants Netflix ni
      // son numéro : on fournit des valeurs factices valides (le paiement est
      // de toute façon sauté côté backend via APPLE_REVIEW_MODE).
      const reviewEmail = netflixEmail || user?.email || 'review@moobilpay.com';
      const reviewPassword = netflixPassword || 'review';
      const reviewPhone = phoneNumber || '696080087';

      const initRes = await axios.post(
        `${Config.apiUrl}/api/payment/init-mobile-money`,
        {
          numeroOM: reviewPhone,
          phone: reviewPhone,
          email: reviewEmail,
          motDePasse: reviewPassword,
          typeDePlan: selectedPlanId,
          userId: user?.uid,
          amount: selectedPlan?.price ?? 0,
        },
        { headers: { 'ngrok-skip-browser-warning': 'true', Authorization: `Bearer ${idToken}` } }
      );

      const { transactionId: txId, planActivationId: paId } = initRes.data || {};
      setTransactionId(txId || '');
      setPlanActivationId(paId || '');

      // Lance l'abonnement en arrière-plan (le backend émet payment_validated/activationcreated).
      const idToken2 = await user?.getIdToken();
      axios.post(
        `${Config.apiUrl}/api/subscription/init`,
        {
          typeDePlan: selectedPlanId,
          email: reviewEmail,
          motDePasse: reviewPassword,
          planActivationId: paId,
          userId: user?.uid,
          transactionId: txId,
          amount: selectedPlan?.price ?? 0,
          numeroOM: reviewPhone,
          useOrchestration: false,
        },
        { headers: { 'ngrok-skip-browser-warning': 'true', Authorization: `Bearer ${idToken2}` } }
      ).catch((err) => console.log('[review] subscription/init (ignoré):', err?.message));

      // Mode review : pas d'écran Reçu, on renvoie directement à l'accueil.
      router.replace('/(tabs)/');
    } catch (err: any) {
      console.error('[review] handleReviewSkip:', err?.message);
      Alert.alert('Erreur', "Impossible de finaliser. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Étape 1.5 → 2 (step 1) — API credentials ────────────────────────────
  const handleNetflixInfoContinue = async () => {
    if (!userFirstName.trim() || !userLastName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom et prénom.');
      return;
    }
    setIsLoading(true);
    try {
      const idToken = await user?.getIdToken();
      const res = await axios.post(
        `${Config.apiUrl}/api/netflix/credentials`,
        { userId: user?.uid, nom: userLastName.trim(), prenom: userFirstName.trim() },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (res.data.success && res.data.data) {
        setNetflixEmail(res.data.data.email);
        setNetflixPassword(res.data.data.password);
        setCurrentPage(2);
        setActiveStep(1);
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer/créer le compte Netflix.');
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert('Erreur', 'Ce nom et prénom est déjà utilisé. Veuillez en choisir un autre.');
      } else {
        Alert.alert('Erreur', 'Impossible de générer le compte Netflix. Vérifiez votre connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Étape 3 → 4 ─────────────────────────────────────────────────────────
  // ─── Étape 3 : Continuer après sélection de méthode ─────────────────────
  // Orange/MTN → ouvre directement le bottom sheet (pas de step 4 téléphone)
  // Card/PayPal → va au step 4 (formulaire dans l'app)
  const handleMethodContinue = () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'orangemoney' || selectedMethod === 'mtnmoney') {
      // Déclencher le paiement mobile money immédiatement
      handleMobileMoneyPayment();
    } else {
      // Carte ou PayPal → aller au formulaire de détails
      setActiveStep(2);
    }
  };

  // ─── Étape 4 : Payer ─────────────────────────────────────────────────────
  const handlePaymentSubmit = async () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'orangemoney' || selectedMethod === 'mtnmoney') {
      await handleMobileMoneyPayment();
    } else if (selectedMethod === 'card') {
      await handleCardPayment();
    } else if (selectedMethod === 'paypal') {
      await handlePayPalPayment();
    }
  };

  // ─── Mobile Money : flux EXACT du frontend ────────────────────────────────
  // 1. startInitializing() → bottom sheet s'ouvre (isInitializing = true)
  // 2. POST init-mobile-money → paymentLink, transactionId
  // 3. openModal(link, txId) → isInitializing = false après DISPLAY_TIME (6s)
  //    Pendant ces 6s, la WebView charge EN FOND (invisible)
  //    Après 6s → si WebView chargée : visible. Sinon : overlay "Chargement..."
  // 4. POST subscription/init (fire-and-forget) → verificationStep = 1
  // 5. Socket "payment_validated" → fermeture → page 5
  // 6. Fermeture manuelle → isCancelling + POST /cancel
  const handleMobileMoneyPayment = async () => {
    console.log(`💳 [PAYMENT] Lancement paiement Mobile Money pour le plan: ${selectedPlanId}`);
    startInitializing();

    try {
      const idToken = await user?.getIdToken();
      console.log('💳 [PAYMENT] Requête POST /api/payment/init-mobile-money...');
      
      const paymentRes = await axios.post(
        `${Config.apiUrl}/api/payment/init-mobile-money`,
        {
          numeroOM: phoneNumber,
          email: netflixEmail,
          motDePasse: netflixPassword,
          typeDePlan: selectedPlanId,
          userId: user?.uid,
          amount: selectedPlan?.price,
        },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!paymentRes.data.success || (!paymentRes.data.paymentLink && !paymentRes.data.skipPayment)) {
        console.error('❌ [PAYMENT-ERROR] Échec initiation:', paymentRes.data);
        setShowPaymentModal(false);
        setIsInitializing(false);
        Alert.alert('Erreur', 'Réponse invalide du serveur de paiement.');
        return;
      }

      const { paymentLink: link, transactionId: txId, planActivationId: paId, skipPayment } = paymentRes.data;
      console.log(`✅ [PAYMENT-SUCCESS] IDs reçus: Tx=${txId}, Activation=${paId}`);
      console.log(`🔗 [PAYMENT-SUCCESS] Link: ${link}`);

      setPlanActivationId(paId);
      setTransactionId(txId);

      if (skipPayment) {
        // MODE REVIEW APPLE : le backend a sauté le paiement réel.
        // On n'ouvre pas le webview : on ferme l'init et on passe direct à
        // l'étape Traitement. L'activation (statut + socket activationcreated)
        // est déclenchée par subscription/init lancé ci-dessous.
        console.log('🍏 [APPLE-REVIEW] skipPayment reçu → webview sauté, passage à l\'étape Traitement.');
        setIsInitializing(false);
        setShowPaymentModal(false);
        setVerificationStep(2);
        setCurrentPage(5);
      } else {
        openModal(link, txId);
      }

      console.log('📝 [SUBSCRIPTION] Lancement initSubscription en background...');
      const idToken2 = await user?.getIdToken();
      axios.post(
        `${Config.apiUrl}/api/subscription/init`,
        {
          typeDePlan: selectedPlanId,
          email: netflixEmail,
          motDePasse: netflixPassword,
          planActivationId: paId,
          userId: user?.uid,
          transactionId: txId,
          amount: selectedPlan?.price,
          numeroOM: phoneNumber,
          useOrchestration: false,
        },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${idToken2}`,
          },
        }
      ).then(() => {
        console.log('📝 [SUBSCRIPTION-DONE] Processus d\'abonnement lancé avec succès.');
        setVerificationStep((prev) => Math.max(prev, 1));
      })
      .catch((err) => {
        // Souvent une "Network Error" due au passage en background pour l'USSD.
        // On ne bloque pas car le polling serveur tourne normalement déjà.
        console.log('📝 [SUBSCRIPTION-NOTE] Requête init terminée (possible coupure réseau background).');
        setVerificationStep((prev) => Math.max(prev, 1));
      });

    } catch (err: any) {
      console.error('❌ [PAYMENT-CRASH] Erreur critique:', err.message);
      setShowPaymentModal(false);
      setIsInitializing(false);
      Alert.alert(
        'Erreur',
        err.response?.data?.message || "Erreur lors de l'initialisation du paiement."
      );
    }
  };

  // ─── Carte ────────────────────────────────────────────────────────────────
  const handleCardPayment = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const orderNum = `YU${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionId(orderNum);
      setVerificationStep(2);
      setCurrentPage(5);
      setTimeout(() => {
        setVerificationStep(3);
        setTimeout(() => setCurrentPage(6), 1500);
      }, 2000);
    } catch {
      Alert.alert('Erreur', 'Erreur lors du traitement de la carte.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── PayPal ───────────────────────────────────────────────────────────────
  const handlePayPalPayment = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setVerificationStep(1);
      setCurrentPage(5);
    } catch {
      Alert.alert('Erreur', 'Erreur PayPal.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Stepper ─────────────────────────────────────────────────────────────
  const renderStepper = () => (
    <View style={styles.stepperWrapper}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${stepperProgress}%` as any }]} />
      </View>
      <View style={styles.stepsRow}>
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isCompleted = stepNumber > num;
          const isActive = stepNumber === num;
          return (
            <View key={num} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted,
              ]}>
                {isCompleted
                  ? <Ionicons name="checkmark" size={13} color="#fff" />
                  : <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{num}</Text>}
              </View>
              <Text style={[styles.stepLabel, (isActive || isCompleted) && styles.stepLabelActive]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  // ─── Corps selon page/étape ────────────────────────────────────────────────
  const renderBody = () => {
    if (currentPage === 1) {
      return (
        <StepPlanSelection
          plans={plans}
          selectedPlanId={selectedPlanId}
          loading={plansLoading}
          submitting={isLoading}
          onSelectPlan={setSelectedPlanId}
          onContinue={handlePlanContinue}
        />
      );
    }
    if (currentPage === 1.5) {
      return (
        <StepNetflixInfo
          selectedPlan={selectedPlan}
          userFirstName={userFirstName}
          userLastName={userLastName}
          onFirstNameChange={setUserFirstName}
          onLastNameChange={setUserLastName}
          onContinue={handleNetflixInfoContinue}
          onBack={() => setCurrentPage(1)}
          loading={isLoading}
        />
      );
    }
    if (currentPage === 2 && activeStep === 1) {
      return (
        <StepPaymentMethod
          selectedPlan={selectedPlan}
          selectedMethod={selectedMethod}
          onSelectMethod={setSelectedMethod}
          onContinue={handleMethodContinue}
          onBack={() => setCurrentPage(1.5)}
        />
      );
    }
    if (currentPage === 2 && activeStep === 2 && selectedMethod) {
      return (
        <StepPaymentDetails
          selectedPlan={selectedPlan}
          selectedMethod={selectedMethod}
          phoneNumber={phoneNumber}
          onPhoneChange={setPhoneNumber}
          cardNumber={cardNumber}
          cardName={cardName}
          expiryDate={expiryDate}
          cvv={cvv}
          onCardNumberChange={setCardNumber}
          onCardNameChange={setCardName}
          onExpiryChange={setExpiryDate}
          onCvvChange={setCvv}
          onSubmit={handlePaymentSubmit}
          onBack={() => setActiveStep(1)}
          isLoading={isLoading}
        />
      );
    }
    if (currentPage === 5) {
      return <StepProcessing verificationStep={verificationStep} />;
    }
    if (currentPage === 6) {
      return (
        <StepReceipt
          selectedPlan={selectedPlan}
          netflixEmail={netflixEmail}
          transactionId={transactionId}
          onGoToActivations={() => router.replace('/(tabs)/activations')}
          onGoHome={() => router.replace('/(tabs)/')}
        />
      );
    }
    return null;
  };

  // ─── Rendu principal ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Loader global (page 1.5 seulement) */}
      <AppLoader visible={isLoading && currentPage === 1.5} message="Vérification..." />

      {/* Header avec action Home */}
      <PageHeader
        title="Réabonnement"
        subtitle="Choisissez votre plan Netflix"
        icon="play-circle"
        variant="glass"
        rightElement={
          <TouchableOpacity 
            onPress={handleHome}
            style={styles.homeHeaderBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Stepper */}
      {renderStepper()}

      {/* Corps */}
      <View style={styles.body}>{renderBody()}</View>

      {/* ── Bottom Sheet de paiement Mobile Money ── */}
      {/* Réplique exacte de <ion-modal [initialBreakpoint]="0.8"> */}
      <PaymentBottomSheet
        isOpen={showPaymentModal}
        paymentUrl={paymentUrl}
        isInitializing={isInitializing}
        isCancelling={isCancelling}
        frameLoaded={frameLoaded}
        isInstantClose={isInstantClose}
        onClose={closePaymentModal}
        onFrameLoad={() => setFrameLoaded(true)}
        onUIValidated={() => {
          // DETECTION TURBO
          if (currentPage < 5) {
            console.log('⚡ [TURBO-UI] Succès visible dans WebView ! Passage IMMÉDIAT à l\'étape d\'activation.');
            closeModalOnSuccess();
            setVerificationStep(2);
            setCurrentPage(5);
          }
        }}
        onUIFailed={() => {
          console.log('🔴 [PAY-SCREEN] Échec détecté par le Turbo !');
          // On signale au backend d'arrêter le polling car l'UI a vu l'échec
          cancelPayment();
        }}
        recoveryTrigger={recoveryTrigger}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { flex: 1 },
  // ── Header Action ──
  homeHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  // ── Stepper ──
  stepperWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 50,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  stepCircleActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  stepCircleCompleted: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  stepNumActive: { color: '#dc2626' },
  stepLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLabelActive: { color: '#475569' },
});

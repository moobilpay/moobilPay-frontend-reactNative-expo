/**
 * PaymentBottomSheet.tsx
 *
 * Réplique exacte du <ion-modal [initialBreakpoint]="0.8" [breakpoints]="[0, 0.8, 1]"> du frontend.
 * Utilisant Modal de React Native pour une fermeture infaillible.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.82;
const EXTRA_LOAD_DELAY = 3000;

interface Props {
  isOpen: boolean;
  paymentUrl: string;
  isInitializing: boolean;
  isCancelling: boolean;
  frameLoaded: boolean;
  isInstantClose?: boolean;
  onClose: () => void;
  onFrameLoad: () => void;
  onUIValidated?: () => void;
  onUIFailed?: () => void;
  recoveryTrigger?: number; // Incrémenté par le parent pour forcer un check
}

export default function PaymentBottomSheet({
  isOpen,
  paymentUrl,
  isInitializing,
  isCancelling,
  frameLoaded,
  isInstantClose = false,
  onClose,
  onFrameLoad,
  onUIValidated,
  onUIFailed,
  recoveryTrigger = 0,
}: Props) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(false);
  const [frameVisuallyReady, setFrameVisuallyReady] = useState(false);
  const extraDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHandledResult = useRef(false);
  const webViewRef = useRef<WebView>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'failed' | 'success'>('idle');

  // Détection du trigger de récupération (Réveil) : on re-déclenche le check JS
  // (au cas où la WebView aurait reçu du contenu utile entre temps).
  // La détection plus fiable se fait côté pay.tsx via /api/payment/status
  // car les liens Flutterwave deviennent inutilisables après une tentative.
  useEffect(() => {
    if (isOpen && recoveryTrigger > 0 && webViewRef.current && !hasHandledResult.current) {
      console.log('🔄 [RECOVERY-BRIDGE] Re-scan DOM de la WebView...');
      webViewRef.current.injectJavaScript('if(typeof check === "function") check(); true;');
    }
  }, [recoveryTrigger, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFrameVisuallyReady(false);
      if (extraDelayTimer.current) clearTimeout(extraDelayTimer.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (frameLoaded && !frameVisuallyReady) {
      extraDelayTimer.current = setTimeout(() => {
        setFrameVisuallyReady(true);
      }, EXTRA_LOAD_DELAY);
    }
    return () => {
      if (extraDelayTimer.current) clearTimeout(extraDelayTimer.current);
    };
  }, [frameLoaded]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      hasHandledResult.current = false; // Reset au déploiement
      setPaymentStatus('idle'); // Reset l'état visuel
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      const duration = isInstantClose ? 0 : 280;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false);
      });
    }
  }, [isOpen]);

  const showLoadingOverlay =
    !isInitializing && !isCancelling && !frameVisuallyReady && paymentUrl !== '' && paymentStatus === 'idle';

  return (
    <Modal
      visible={isOpen || isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.notch} />

          {!isInitializing && !isCancelling && (
            <View style={styles.header}>
              <LinearGradient
                colors={['#230f0f', '#3e1616']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.shieldBadge}>
                    <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
                  </View>
                  <Text style={styles.headerTitle}>Paiement Sécurisé</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.closeBtnText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.content}>
            {isCancelling && paymentStatus === 'idle' && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#dc2626" />
                <Text style={styles.overlayTitle}>Annulation du paiement en cours...</Text>
                <Text style={styles.overlaySubtitle}>Veuillez patienter</Text>
              </View>
            )}

            {isInitializing && !isCancelling && paymentStatus === 'idle' && (
              <View style={styles.overlay}>
                <View style={styles.bigSpinner}>
                  <ActivityIndicator size="large" color="#dc2626" />
                </View>
                <Text style={styles.overlayTitle}>Initialisation du paiement...</Text>
                <Text style={styles.overlaySubtitle}>
                  Création de la transaction sécurisée en cours...
                </Text>
              </View>
            )}

            {showLoadingOverlay && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#dc2626" />
                <Text style={styles.overlayTitle}>Chargement du paiement sécurisé...</Text>
                <View style={styles.instructionRow}>
                  <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
                  <Text style={styles.instructionText}>
                    Choisissez votre réseau et entrez votre numéro de paiement
                  </Text>
                </View>
              </View>
            )}

            {paymentStatus === 'failed' ? (
              <View style={styles.errorContainer}>
                <View style={styles.errorIconCircle}>
                  <Ionicons name="close-circle" size={56} color="#ef4444" />
                </View>
                <Text style={styles.errorTitle}>Paiement échoué</Text>
                <Text style={styles.errorSubtitle}>
                  La transaction a été annulée ou n'a pas pu être validée par l'opérateur.
                </Text>
                
                <TouchableOpacity 
                  style={styles.retryBtn} 
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    style={styles.retryBtnGradient}
                  >
                    <Text style={styles.retryBtnText}>Fermer et Réessayer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : paymentStatus === 'success' ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
                </View>
                <Text style={styles.successTitle}>Paiement Réussi !</Text>
                <Text style={styles.successSubtitle}>
                  Votre transaction est validée. Redirection en cours...
                </Text>
                <ActivityIndicator size="small" color="#22c55e" style={{ marginTop: 12 }} />
              </View>
            ) : paymentUrl !== '' && !isInitializing && !isCancelling && (
              Platform.OS === 'web' ? (
                /* Support WEB avec iframe */
                <iframe
                  src={paymentUrl}
                  style={{
                    flex: 1,
                    borderWidth: 0,
                    width: '100%',
                    height: '100%',
                    display: frameVisuallyReady ? 'block' : 'none'
                  } as any}
                  onLoad={(e) => {
                    console.log('🌐 [WEB-IFRAME] Une page a été chargée ou une redirection a eu lieu.');
                    onFrameLoad();
                  }}
                />
              ) : (
                /* Support MOBILE avec WebView native */
                <WebView
                  ref={webViewRef}
                  source={{ uri: paymentUrl }}
                  style={[styles.webView, !frameVisuallyReady && styles.webViewHidden]}
                  onLoad={onFrameLoad}
                  onError={(e) => {
                    // Si on a déjà capté un succès ou un échec, on ignore les erreurs de redirection finales
                    if (hasHandledResult.current) return;
                    
                    if (!e.nativeEvent.url.includes('localhost')) {
                      console.error('❌ [WEBVIEW-ERROR] Erreur:', e.nativeEvent);
                    }
                    onFrameLoad();
                  }}
                  onShouldStartLoadWithRequest={(request) => {
                    const url = request.url.toLowerCase();
                    
                    // Si on a déjà fini, on gèle le navigateur
                    if (hasHandledResult.current) return false;

                    // Filtrer les intentions mobiles qui causent l'erreur -1002 (Intent/Tel/SMS)
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                      console.log('📱 [WEBVIEW-INTENT] Bloqué pour éviter l\'erreur native:', url);
                      return false; 
                    }

                    return true;
                  }}
                  onNavigationStateChange={(navState) => {
                    if (hasHandledResult.current) return;
                    const url = navState.url.toLowerCase();
                    
                    const failureIndicators = [
                      'status=failed', 'status=cancelled', 'status=canceled', 'status=closed',
                      'cancel', 'canceled', 'closed', 'error', 'declined', 'rejected',
                    ];
                    if (failureIndicators.some(i => url.includes(i))) {
                      console.log('❌ [TURBO-URL] Échec détecté !');
                      hasHandledResult.current = true;
                      setPaymentStatus('failed'); // Affichage de la jolie vue erreur
                      if (onUIFailed) onUIFailed();
                      return;
                    }

                    const successIndicators = ['success', 'completed', 'done'];
                    if (successIndicators.some(i => url.includes(i)) || (url.includes('tx_ref') && !url.includes('failed'))) {
                      console.log('🚀 [TURBO-URL] Succès détecté !');
                      hasHandledResult.current = true;
                      setPaymentStatus('success'); // Affichage de la jolie vue succès
                      if (onUIValidated) onUIValidated();
                    }
                  }}
                  onMessage={(event) => {
                    if (hasHandledResult.current) return;
                    try {
                      const data = typeof event.nativeEvent.data === 'string' && event.nativeEvent.data.startsWith('{') 
                        ? JSON.parse(event.nativeEvent.data) 
                        : { type: event.nativeEvent.data };

                      if (data.type === 'PAYMENT_FAILED') {
                         console.log('❌ [TURBO-JS] Échec détecté !');
                         hasHandledResult.current = true;
                         setPaymentStatus('failed');
                         if (onUIFailed) onUIFailed();
                      } else if (data.type === 'PAYMENT_SUCCESS') {
                         console.log('🚀 [TURBO-JS] Succès détecté !');
                         hasHandledResult.current = true;
                         setPaymentStatus('success');
                         if (onUIValidated) onUIValidated();
                      }
                    } catch (e) {
                       // Fallback simple
                    }
                  }}
                  injectedJavaScript={`
                    (function() {
                      window.check = function() {
                        if (!document.body) return;
                        var text = document.body.innerText.toLowerCase();
                        var url = window.location.href.toLowerCase();
                        
                        var fail = [
                          "echoue", "échoué", "failed", "annulé", "annule", "annulee", "annulée",
                          "canceled", "cancelled", "cancel", "closed", "error", "erreur",
                          "rejected", "rejeté", "declined", "refusé", "refuse",
                          "transaction failed", "transaction annulée", "payment cancelled",
                          "status=failed"
                        ];
                        var success = ["success", "approved", "completed", "done"];
                        
                        if (fail.some(function(k){ return text.indexOf(k)!==-1 || url.indexOf(k)!==-1})) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({type:"PAYMENT_FAILED"}));
                        } else if (success.some(function(k){ return text.indexOf(k)!==-1 || url.indexOf(k)!==-1}) || (url.indexOf("tx_ref")!==-1 && url.indexOf("failed")===-1)) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({type:"PAYMENT_SUCCESS"}));
                        }
                      };
                      setInterval(window.check, 2000);
                      window.check();
                    })();
                    true;
                  `}
                  javaScriptEnabled
                  domStorageEnabled
                  startInLoadingState={false}
                  originWhitelist={['*']}
                  setSupportMultipleWindows={true}
                  allowsBackForwardNavigationGestures={false}
                />
              )
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 30,
  },
  notch: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    height: 52,
    position: 'relative',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    zIndex: 10,
    padding: 32,
  },
  bigSpinner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  overlaySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    width: '100%',
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#3b82f6',
    lineHeight: 20,
  },
  webView: {
    flex: 1,
  },
  webViewHidden: {
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  // Nouveaux styles pour les erreurs et succès intégrés
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 100,
  },
  errorIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  retryBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 100,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});

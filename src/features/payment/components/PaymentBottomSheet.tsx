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
  onUIValidated?: () => void; // Nouveau: pour fermer dès que la WebView voit le succès
  onUIFailed?: () => void; // Nouveau: pour fermer dès que la WebView voit un échec
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
}: Props) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(false);
  const [frameVisuallyReady, setFrameVisuallyReady] = useState(false);
  const extraDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  console.log(`📑 [SHEET-RENDER] isOpen:${isOpen}, initialize:${isInitializing}, cancel:${isCancelling}, visuallyReady:${frameVisuallyReady}`);

  const showLoadingOverlay =
    !isInitializing && !isCancelling && !frameVisuallyReady && paymentUrl !== '';

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
            {isCancelling && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#dc2626" />
                <Text style={styles.overlayTitle}>Annulation du paiement en cours...</Text>
                <Text style={styles.overlaySubtitle}>Veuillez patienter</Text>
              </View>
            )}

            {isInitializing && !isCancelling && (
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

            {paymentUrl !== '' && !isInitializing && !isCancelling && (
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
                  source={{ uri: paymentUrl }}
                  style={[styles.webView, !frameVisuallyReady && styles.webViewHidden]}
                  onLoad={onFrameLoad}
                  onError={(e) => {
                    console.error('❌ [WEBVIEW-ERROR] Erreur de chargement:', e.nativeEvent);
                    onFrameLoad();
                  }}
                  onNavigationStateChange={(navState) => {
                    console.log('🌐 [WEBVIEW-NAV] URL:', navState.url);
                    
                    // DÉTECTION TURBO DU SUCCÈS PAR URL
                    const successIndicators = ['success', 'completed', 'tx_ref', 'done', 'transaction_id'];
                    const isSuccessURL = successIndicators.some(indicator => 
                      navState.url.toLowerCase().includes(indicator)
                    );

                    if (isSuccessURL) {
                      console.log('🚀 [TURBO-DETECTION] Succès détecté via URL ! Fermeture précoce...');
                      if (onUIValidated) onUIValidated();
                    }

                    console.log('🌐 [WEBVIEW-NAV] Titre:', navState.title);
                  }}
                  onMessage={(event) => {
                    try {
                      const data = JSON.parse(event.nativeEvent.data);
                      if (data.type === 'PAYMENT_FAILED') {
                         console.log('❌ [TURBO-DETECTION] Échec détecté via le contenu de la page ! Fermeture précoce...');
                         if (onUIFailed) onUIFailed();
                         else onClose();
                      }
                    } catch (e) {
                      console.log('✉️ [WEBVIEW-MSG] Message reçu:', event.nativeEvent.data);
                    }
                  }}
                  injectedJavaScript={`
                    (function() {
                      function checkFailure() {
                        if (document.body) {
                          var text = document.body.innerText.toLowerCase();
                          // Mots-clés indiquant un échec ou annulation par l'utilisateur
                          if (text.includes("echoue") || text.includes("échoué") || 
                              text.includes("transaction a echoue") || text.includes("transaction a échoué") ||
                              text.includes("payment failed") || text.includes("annulé")) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "PAYMENT_FAILED" }));
                            return; // Stop checking if we found it
                          }
                        }
                        setTimeout(checkFailure, 2000); // Revérifie toutes les 2 secondes
                      }
                      setTimeout(checkFailure, 2000);
                    })();
                    true;
                  `}
                  javaScriptEnabled
                  domStorageEnabled
                  startInLoadingState={false}
                  originWhitelist={['*']}
                  setSupportMultipleWindows={false} // BLOQUE LES POPUPS qui ralentissent
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
  },
});

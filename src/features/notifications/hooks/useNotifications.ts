import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useAuth } from '../../auth/context/AuthContext';
import { userFirestore } from '../../auth/services/userFirestore';
import { storage } from '../../../utils/storage';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const IS_NOTIFICATIONS_ENABLED = Platform.OS !== 'web' && process.env.EXPO_PUBLIC_DISABLE_NOTIFICATIONS !== 'true';

// Configuration du comportement des notifications quand l'app est au premier plan
if (IS_NOTIFICATIONS_ENABLED) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export function useNotifications() {
    const { user: firebaseUser, userData: user } = useAuth();
    const router = useRouter();
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    const checkAndSyncToken = useCallback(async (token: string) => {
        try {
            if (!user || !firebaseUser) {
                await storage.set('unsentFcmToken', token);
                return;
            }

            if (user.fcmToken !== token) {
                console.log('📤 [NOTIFICATIONS] Synchronisation du token avec le backend...');
                await userFirestore.updateUser({ ...user, fcmToken: token }, firebaseUser);
                await storage.remove('unsentFcmToken');
            }
        } catch (err) {
            console.error('❌ [NOTIFICATIONS] Erreur synchro token:', err);
        }
    }, [user, firebaseUser]);

    useEffect(() => {
        if (!IS_NOTIFICATIONS_ENABLED) {
            console.log('ℹ️ [NOTIFICATIONS] Désactivées sur le Web ou via variable d\'environnement.');
            return;
        }

        // 1. Gérer le clic quand l'application était COMPLÈTEMENT fermée (Cold Start)
        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response) {
                console.log('🚀 [NOTIFICATIONS] App lancée depuis une notification !');
                // Délai pour laisser le temps à AppInitializer de faire sa redirection d'authentification vers /(tabs)
                setTimeout(() => {
                    router.push('/(tabs)/notifications');
                }, 1500);
            }
        }).catch(err => console.log('Information: getLastNotificationResponseAsync non supporté ici:', err.message));

        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token) {
                checkAndSyncToken(token);
            }
        });

        // 2. Listener pour les notifications reçues quand l'app est OUVERTE
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('🔔 [NOTIFICATIONS] Reçue au premier plan:', notification);
        });

        // 3. Listener pour le clic quand l'app est en ARRIÈRE-PLAN (Background)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('👆 [NOTIFICATIONS] Action détectée (Arrière-plan):', response.notification.request.content.data);
            // Petit délai pour assurer que le router est prêt
            setTimeout(() => {
                router.push('/(tabs)/notifications');
            }, 500);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [router, checkAndSyncToken]);

    useEffect(() => {
        if (user && firebaseUser && expoPushToken) {
            checkAndSyncToken(expoPushToken);
        }
    }, [user, firebaseUser, expoPushToken, checkAndSyncToken]);

    async function registerForPushNotificationsAsync() {
        let token;

        console.log('📱 [NOTIFICATIONS] Début de l\'enregistrement...');

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('moobilpay_channel_v2', {
                name: 'Notifications MoobilPay',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#dc2626',
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                sound: 'default',
            });
        }

        // On tente la permission dans tous les cas pour diagnostiquer
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        console.log('📱 [NOTIFICATIONS] État actuel des permissions:', existingStatus);

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('⚠️ [NOTIFICATIONS] Permission refusée pour les notifications push');
            return;
        }

        if (Device.isDevice || true) { // Forcé pour le debug
            try {
                // Pour utiliser FCM directement avec le Firebase Admin SDK du backend,
                // on a besoin du token NATIF de l'appareil, pas du token Expo.
                token = (await Notifications.getDevicePushTokenAsync()).data;
                console.log('✅ [NOTIFICATIONS] Native FCM Token récupéré:', token);
            } catch (e: any) {
                console.error('❌ [NOTIFICATIONS] Erreur lors de la récupération du token:', e.message);
            }
        } else {
            console.log('ℹ️ [NOTIFICATIONS] Simulateur détecté : pas de token push (mais permissions demandées)');
        }

        return token;
    }

    return { expoPushToken };
}

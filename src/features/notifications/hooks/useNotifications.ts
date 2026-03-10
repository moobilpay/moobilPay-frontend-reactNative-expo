import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useAuth } from '../../auth/context/AuthContext';
import { userFirestore } from '../../auth/services/userFirestore';
import { storage } from '../../../utils/storage';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

// Configuration du comportement des notifications quand l'app est au premier plan
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function useNotifications() {
    const { user: firebaseUser, userData: user } = useAuth();
    const router = useRouter();
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);

    // Hook Expo ultra-fiable pour capter le clic sur une notif (app fermée ou en arrière-plan)
    const lastNotificationResponse = Notifications.useLastNotificationResponse();
    const handledResponseId = useRef<string | null>(null);

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

    // Redirection au clic sur une notification (seulement quand le user est authentifié)
    useEffect(() => {
        if (lastNotificationResponse && user) {
            const currentResponseId = lastNotificationResponse.notification.request.identifier;

            // Éviter de rediriger en boucle pour la même notification
            if (handledResponseId.current !== currentResponseId) {
                console.log('🚀 [NOTIFICATIONS] Action (Cold Start/Background) détectée !');
                console.log('📦 [NOTIFICATIONS] Payload complet du clic:', JSON.stringify(lastNotificationResponse.notification.request.content, null, 2));

                handledResponseId.current = currentResponseId;

                // Petit délai pour que la navigation principale (Tabs) finisse de se monter post-auth
                setTimeout(() => {
                    router.push('/(tabs)/notifications');
                }, 800);
            }
        }
    }, [lastNotificationResponse, user, router]);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token) {
                checkAndSyncToken(token);
            }
        });

        // Listener pour les notifications reçues quand l'app est OUVERTE au premier plan
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('🔔 [NOTIFICATIONS] Reçue au premier plan !');
            console.log('📦 [NOTIFICATIONS] Payload premier plan:', JSON.stringify(notification.request.content, null, 2));
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
        };
    }, [checkAndSyncToken]);

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

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

    // Hook Expo ultra-fiable pour capter le clic sur une notif (app fermée ou en arrière-plan)
    // Désactivé sur le web de manière sûre pour éviter les crashs de rendu
    const lastNotificationResponse = (() => {
        if (!IS_NOTIFICATIONS_ENABLED) return null;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return Notifications.useLastNotificationResponse();
    })();
    const handledResponseId = useRef<string | null>(null);

    const checkAndSyncToken = useCallback(async (token: string) => {
        try {
            if (!user || !firebaseUser) {
                await storage.set('unsentFcmToken', token);
                return;
            }

            const tokenType: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';
            if (user.fcmToken !== token || user.tokenType !== tokenType) {
                console.log(`📤 [NOTIFICATIONS] Synchronisation du token (${tokenType}) avec le backend...`);
                await userFirestore.updateUser({ ...user, fcmToken: token, tokenType }, firebaseUser);
                await storage.remove('unsentFcmToken');
            }
        } catch (err) {
            console.error('❌ [NOTIFICATIONS] Erreur synchro token:', err);
        }
    }, [user, firebaseUser]);

    // Redirection au clic sur une notification (seulement quand le user est authentifié)
    useEffect(() => {
        if (!IS_NOTIFICATIONS_ENABLED) {
            console.log('ℹ️ [NOTIFICATIONS] Désactivées sur le Web ou via variable d\'environnement.');
            return;
        }

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

    // Listener foreground : monté dès le démarrage (indépendant de l'auth)
    useEffect(() => {
        if (!IS_NOTIFICATIONS_ENABLED) return;

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('🔔 [NOTIFICATIONS] Reçue au premier plan !');
            console.log('📦 [NOTIFICATIONS] Payload premier plan:', JSON.stringify(notification.request.content, null, 2));
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
        };
    }, []);

    // Demande de permission + récupération du token : UNIQUEMENT après authentification
    useEffect(() => {
        if (!IS_NOTIFICATIONS_ENABLED) return;
        if (!firebaseUser) return;
        if (expoPushToken) return; // déjà récupéré

        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token) {
                checkAndSyncToken(token);
            }
        });
    }, [firebaseUser, expoPushToken, checkAndSyncToken]);

    useEffect(() => {
        if (user && firebaseUser && expoPushToken) {
            checkAndSyncToken(expoPushToken);
        }
    }, [user, firebaseUser, expoPushToken, checkAndSyncToken]);

    async function registerForPushNotificationsAsync() {
        if (!IS_NOTIFICATIONS_ENABLED) return undefined;

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
                // Token natif: FCM sur Android, APNs brut sur iOS (le backend route selon la plateforme)
                token = (await Notifications.getDevicePushTokenAsync()).data;
                console.log(`✅ [NOTIFICATIONS] Native ${Platform.OS} token récupéré:`, token);
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

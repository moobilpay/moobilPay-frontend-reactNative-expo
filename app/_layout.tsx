import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/features/auth/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '../src/features/notifications/hooks/useNotifications';

// Empêche le splash screen de se cacher automatiquement
// (peut échouer si le splash natif n'est pas encore enregistré pour la vue)
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppInitializer({ onSplashHidden }: { onSplashHidden: () => void }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  
  // Initialisation des notifications push
  useNotifications();

  useEffect(() => {
    async function checkNavigation() {
      // 1. Attendre la fin du chargement initial (cache ou API)
      if (loading) return;

      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const rootSegment = segments[0];

      // On considère qu'on est dans le groupe d'auth si on est sur la racine, le login ou l'onboarding
      const inAuthGroup = !rootSegment || rootSegment === 'login' || rootSegment === '(auth)';

      if (user && userData) {
        // Utilisateur connecté -> si pas déjà dans l'app, on y va
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      } else if (!user) {
        // Pas d'utilisateur Firebase
        if (hasSeenOnboarding === 'true') {
          // Déjà vu l'onboarding -> direction Login
          if (rootSegment !== 'login') router.replace('/login');
        } else {
          // Nouveau -> direction Onboarding (racine)
          if (rootSegment) router.replace('/');
        }
      }
      
      // 2. On attend un court délai après la navigation éventuelle pour cacher le splash
      // Cela évite de voir l'écran de départ avant que la redirection ne soit appliquée
      setTimeout(async () => {
        try {
          await SplashScreen.hideAsync();
          onSplashHidden();
        } catch (e) {
          // Peut arriver si déjà caché
          onSplashHidden();
        }
      }, 500);
    }

    checkNavigation();
  }, [user, userData, loading, segments, onSplashHidden]);

  return null;
}

export default function RootLayout() {
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      import('expo-navigation-bar').then((NavigationBar) => {
        NavigationBar.setBackgroundColorAsync('#00000000');
        NavigationBar.setButtonStyleAsync('light');
        NavigationBar.setBehaviorAsync('overlay-swipe');
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <AppInitializer onSplashHidden={() => setSplashHidden(true)} />
          {/* Barre d'état par défaut pour les écrans à fond sombre (login, onboarding, pay).
              Les écrans avec PageHeader la surchargent eux-mêmes selon leur variante. */}
          <StatusBar
            style="light"
            translucent={true}
            backgroundColor="transparent"
          />
          {/* gestureEnabled: false -> bloque le swipe retour partout, sauf sur "pay" */}
          <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="pay" options={{ gestureEnabled: true }} />
          </Stack>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

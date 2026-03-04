import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/features/auth/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Empêche le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

function AppInitializer() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

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
        } catch (e) {
          // Peut arriver si déjà caché
        }
      }, 500);
    }

    checkNavigation();
  }, [user, userData, loading, segments]);

  return null;
}

export default function RootLayout() {
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
        <AppInitializer />
        <StatusBar style="light" translucent={true} backgroundColor="transparent" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

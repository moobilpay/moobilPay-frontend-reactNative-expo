import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/features/auth/context/AuthContext';
import { AppLoader } from '../src/components/AppLoader';

function AppInitializer() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // Logique de redirection automatique 
    // const inApp = segments[0] !== 'index' && segments[0] !== 'login';
    // if (user && userData && !inApp) {
    //   router.replace('/(tabs)'); // À décommenter quand les tabs seront prêts
    // }
  }, [user, userData, loading, segments]);

  if (loading || (user && !userData)) {
    return (
      <AppLoader visible={true} message="Authentification..." />
    );
  }

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    // Barre de navigation Android (boutons ou gestures en bas)
    if (Platform.OS === 'android') {
      import('expo-navigation-bar').then((NavigationBar) => {
        NavigationBar.setBackgroundColorAsync('#00000000'); // Transparent
        NavigationBar.setButtonStyleAsync('light');         // Icônes blanches
        NavigationBar.setBehaviorAsync('overlay-swipe');   // Mode immersif
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppInitializer />
        {/* StatusBar blanche et transparente — s'applique sur toutes les pages */}
        <StatusBar style="light" translucent={true} backgroundColor="transparent" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

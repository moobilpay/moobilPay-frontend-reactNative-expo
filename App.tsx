import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import OnboardingScreen from './modules/onboarding/OnboardingScreen';
import LoginScreen from './modules/auth/LoginScreen';

const Stack = createStackNavigator();

// Thème transparent pour que NavigationContainer ne peigne pas de fond blanc/noir
const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Rendre la barre de navigation du bas totalement transparente
      NavigationBar.setBackgroundColorAsync('#00000000');
      // Garder les icônes de la barre de navigation en clair (visibles sur fond sombre)
      NavigationBar.setButtonStyleAsync('light');
      // Mode immersif : l'app s'étend sous la barre de navigation
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <SafeAreaProvider>
      {/* StatusBar en blanc, transparente, s'étend sous le dégradé */}
      <StatusBar style="light" translucent={true} backgroundColor="transparent" />
      <NavigationContainer theme={TransparentTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                onComplete={() => {
                  props.navigation.navigate('Login');
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

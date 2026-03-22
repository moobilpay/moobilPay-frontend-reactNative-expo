import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/context/LanguageContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const primaryColor = '#ef4444';
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const inactiveColor = isDark ? '#64748b' : '#64748b';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: [
          styles.tabBar,
          {
            height: Platform.OS === 'android' ? 65 + insets.bottom : undefined,
            paddingBottom: Platform.OS === 'android' ? 8 + insets.bottom : 8,
            borderTopColor: colors.border,
          }
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          )
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs_home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('tabs_transactions'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activations"
        options={{
          title: t('tabs_activations'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('tabs_notifications'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs_settings'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    ...Platform.select({
      ios: {
        position: 'absolute',
      },
      android: {
        elevation: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
      },
      web: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
        position: 'relative' as any,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' as any,
      },
    }),
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});

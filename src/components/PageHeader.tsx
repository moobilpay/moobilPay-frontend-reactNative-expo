import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'premium' | 'glass';
  amount?: string;
  totalStats?: {
    value: string;
    label: string;
  };
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon, 
  variant = 'default',
  amount,
  totalStats,
  rightElement,
  leftElement 
}) => {
  const { colors } = useTheme();

  if (variant === 'premium') {
    return (
      <View style={styles.premiumContainer}>
        <LinearGradient
          colors={["#230f0f", "#2e1a1a", "#3e1616"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumBg}
        />
        <SafeAreaView edges={['top']} style={styles.premiumSafe}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumHeaderRow}>
              {leftElement ? leftElement : (
                <View style={styles.premiumIconContainer}>
                  <Ionicons name={icon} size={24} color="#fff" />
                </View>
              )}
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>{title}</Text>
                {amount ? (
                  <Text style={styles.premiumAmount}>{amount}</Text>
                ) : (
                  subtitle && <Text style={styles.premiumSubtitle}>{subtitle}</Text>
                )}
              </View>
              {totalStats && (
                <View style={styles.totalStatsContainer}>
                  <Text style={styles.totalValue}>{totalStats.value}</Text>
                  <Text style={styles.totalLabel}>{totalStats.label}</Text>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (variant === 'glass') {
    return (
      <View style={styles.glassContainer}>
        <LinearGradient
          colors={["#230f0f", "#2e1a1a", "#3e1616"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassBg}
        />
        <SafeAreaView edges={['top']} style={styles.glassSafe}>
          <View style={styles.glassContent}>
            {leftElement ? leftElement : (
              <View style={styles.glassIconMain}>
                <Ionicons name={icon} size={24} color="#fff" />
              </View>
            )}
            <View style={styles.glassTitles}>
              <Text style={styles.glassTitle}>{title}</Text>
              {subtitle && <Text style={styles.glassSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement && (
              <View style={styles.rightSide}>
                {rightElement}
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.card}>
          <View style={styles.content}>
            {leftElement ? leftElement : (
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color="#dc2626" />
              </View>
            )}
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>
          </View>
          {rightElement && (
            <View style={styles.rightSide}>
              {rightElement}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // DEFAULT VARIANT
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  safeArea: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.select({ android: 15, web: 10, default: 0 }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  rightSide: {
    marginLeft: 10,
  },

  // PREMIUM VARIANT
  premiumContainer: {
    overflow: 'hidden',
    zIndex: 10,
    ...(Platform.OS === 'web' ? { maxWidth: '100%' as any } : {}),
  },
  premiumBg: {
    ...StyleSheet.absoluteFillObject,
  },
  premiumSafe: {
    paddingBottom: 20,
  },
  premiumContent: {
    paddingHorizontal: 20,
    marginTop: Platform.select({ android: 15, web: 10, default: 10 }),
  },
  premiumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  premiumAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  premiumSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  totalStatsContainer: {
    alignItems: 'flex-end',
  },
  totalValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // GLASS VARIANT (For Notifications - Matches header-glass from frontend)
  glassContainer: {
    overflow: 'hidden',
    zIndex: 10,
    ...(Platform.OS === 'web' ? { maxWidth: '100%' as any } : {}),
  },
  glassBg: {
    ...StyleSheet.absoluteFillObject,
  },
  glassSafe: {
    paddingBottom: 20,
  },
  glassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.select({ android: 15, web: 10, default: 10 }),
  },
  glassIconMain: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassTitles: {
    flex: 1,
    marginLeft: 14,
  },
  glassTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  glassSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});

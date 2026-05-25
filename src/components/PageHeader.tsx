import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface PageHeaderProps {
  // Layout par défaut (titre + icône + sous-titre/amount + stats à droite)
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  amount?: string;
  totalStats?: {
    value: string;
    label: string;
  };
  rightElement?: React.ReactNode;

  // Slot custom : si fourni, remplace tout le contenu par défaut
  children?: React.ReactNode;
}

const GRADIENT_COLORS = ['#230f0f', '#2e1a1a', '#3e1616'] as const;

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  amount,
  totalStats,
  rightElement,
  children,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.content}>
          {children ?? (
            <View style={styles.defaultRow}>
              {icon && (
                <View style={styles.iconContainer}>
                  <Ionicons name={icon} size={32} color="#fff" />
                </View>
              )}
              <View style={styles.info}>
                {title && <Text style={styles.title}>{title}</Text>}
                {amount ? (
                  <Text style={styles.amount}>{amount}</Text>
                ) : (
                  subtitle && <Text style={styles.subtitle}>{subtitle}</Text>
                )}
              </View>
              {totalStats && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsValue}>{totalStats.value}</Text>
                  <Text style={styles.statsLabel}>{totalStats.label}</Text>
                </View>
              )}
              {rightElement && <View style={styles.rightSide}>{rightElement}</View>}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    zIndex: 10,
  },
  safe: {
    paddingBottom: 22,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 16 : 8,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  statsValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rightSide: {
    marginLeft: 10,
  },
});

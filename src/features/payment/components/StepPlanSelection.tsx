import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NetflixPlan } from '../types';
import { sharedStyles } from '../styles/shared';

interface Props {
  plans: NetflixPlan[];
  selectedPlanId: string;
  loading: boolean;
  // Requête en cours après clic sur "Continuer" (affiche un loader sur le bouton).
  submitting?: boolean;
  onSelectPlan: (id: string) => void;
  onContinue: () => void;
}

const PLAN_ICONS: Record<string, any> = {
  premium: 'diamond',
  standard: 'desktop',
  basic: 'tv',
  mobile: 'phone-portrait',
};

export default function StepPlanSelection({
  plans,
  selectedPlanId,
  loading,
  submitting = false,
  onSelectPlan,
  onContinue,
}: Props) {
  const [showDetails, setShowDetails] = React.useState(false);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderIcon}>
          <Ionicons name="sync" size={32} color="#dc2626" />
        </View>
        <Text style={styles.loaderText}>Chargement des offres...</Text>
        <View style={styles.loaderBar}>
          <View style={styles.loaderBarFill} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={sharedStyles.stepContent} showsVerticalScrollIndicator={false}>
      {/* 2×2 grid of plan cards */}
      <View style={styles.plansGrid}>
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              activeOpacity={0.85}
              onPress={() => onSelectPlan(plan.id)}
            >
              {/* Popular badge for premium */}
              {plan.id === 'premium' && !isSelected && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={10} color="#fff" />
                  <Text style={styles.popularText}>POPULAIRE</Text>
                </View>
              )}

              <View style={styles.planCardTop}>
                <View style={[styles.planIconBox, isSelected && styles.planIconBoxSelected]}>
                  <Ionicons
                    name={PLAN_ICONS[plan.id] || 'play-circle'}
                    size={22}
                    color={isSelected ? '#fff' : '#ef4444'}
                  />
                </View>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </View>

              <Text style={[styles.planName, isSelected && styles.whiteText]}>{plan.name}</Text>
              <Text style={[styles.planResolution, isSelected && styles.whiteTextMuted]}>
                {plan.resolution}
              </Text>
              <Text style={[styles.planPrice, isSelected && styles.whitePriceText]}>
                {plan.price.toLocaleString()} {plan.currency}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Expandable plan details */}
      {selectedPlan && (
        <TouchableOpacity
          style={styles.detailsCard}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.8}
        >
          <View style={styles.detailsHeaderRow}>
            <Text style={styles.detailsTitle}>{selectedPlan.title}</Text>
            <Ionicons
              name={showDetails ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748b"
            />
          </View>
          {showDetails && (
            <View style={styles.detailsBody}>
              <View style={styles.detailRow}>
                <Ionicons name="tv-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>{selectedPlan.support}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>
                  {selectedPlan.simultaneous} écran(s) simultané(s)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="arrow-down-circle-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>
                  {selectedPlan.downloads} téléchargements inclus
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="musical-notes-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>Audio spatial inclus</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Continue button */}
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={onContinue}
        activeOpacity={0.85}
        disabled={submitting}
      >
        <LinearGradient colors={['#ef4444', '#dc2626']} style={sharedStyles.gradientBtn}>
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={sharedStyles.btnText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loaderIcon: {
    marginBottom: 20,
  },
  loaderText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  loaderBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderBarFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  planCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
    zIndex: 10,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planIconBoxSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  planResolution: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#dc2626',
    marginTop: 6,
  },
  whiteText: { color: '#fff' },
  whiteTextMuted: { color: 'rgba(255,255,255,0.75)' },
  whitePriceText: { color: 'rgba(255,255,255,0.95)' },
  detailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  detailsBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  continueBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});

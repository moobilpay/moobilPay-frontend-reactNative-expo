import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';

const { width, height } = Dimensions.get('window');

const NotificationCard = ({ title, body, time, type, isRead }: any) => {
  const getIcon = () => {
    switch (type) {
      case 'payment': return 'card';
      case 'account': return 'person';
      case 'security': return 'shield-checkmark';
      default: return 'notifications';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'payment': return '#10b981';
      case 'account': return '#3b82f6';
      case 'security': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <TouchableOpacity style={[styles.notifCard, !isRead && styles.unreadCard]}>
      <View style={[styles.cardIconWrapper, { backgroundColor: getColor() + '15' }]}>
        <Ionicons name={getIcon() as any} size={22} color={getColor()} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardTime}>{time}</Text>
        </View>
        <Text style={styles.cardBody} numberOfLines={2}>{body}</Text>
      </View>
      {!isRead && <View style={styles.unreadBadge} />}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const notifications = [
    { id: 1, title: 'Paiement Réussi', body: 'Votre abonnement Netflix a été renouvelé avec succès.', time: 'il y a 2h', type: 'payment', isRead: false },
    { id: 2, title: 'Nouvel Appareil', body: 'Une nouvelle connexion a été détectée sur votre compte.', time: 'il y a 5h', type: 'security', isRead: true },
    { id: 3, title: 'Mise à jour Profil', body: 'Vos informations personnelles ont été mises à jour.', time: 'Hier', type: 'account', isRead: true },
  ];

  return (
    <View style={styles.container}>
      {/* Background Blobs for Glass Effect parity */}
      <View style={styles.backgroundBlobs}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
      </View>

      <PageHeader 
        title="Mes Notifications" 
        subtitle="3 nouvelles" 
        icon="notifications" 
        variant="glass"
        rightElement={
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.notifList}>
          {notifications.map((notif) => (
            <NotificationCard key={notif.id} {...notif} />
          ))}
        </View>

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.iconWrapper}>
              <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>Plus rien ici !</Text>
            <Text style={styles.emptySubtitle}>Vous n'avez pas de nouvelles notifications pour le moment.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundBlobs: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.1,
  },
  blob1: {
    backgroundColor: '#dc2626',
    top: -50,
    right: -50,
  },
  blob2: {
    backgroundColor: '#3b82f6',
    bottom: 50,
    left: -100,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  notifList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  cardIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  cardBody: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  unreadBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 10,
  },
});

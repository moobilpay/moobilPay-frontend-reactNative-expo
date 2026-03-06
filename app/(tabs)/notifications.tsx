import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../src/components/PageHeader';
import { useAuth } from '../../src/features/auth/context/AuthContext';
import { Config } from '../../src/api/config';
import { storage } from '../../src/utils/storage';
import { usePaymentSocket } from '../../src/features/payment/hooks/usePaymentSocket';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const NotificationCard = ({ title, body, createdAt, type, isRead, onPress }: any) => {
  const getIcon = () => {
    switch (type) {
      case 'payment':
      case 'success': return 'card';
      case 'subscription':
      case 'account': return 'person';
      case 'security':
      case 'warning': return 'shield-checkmark';
      default: return 'notifications';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'payment':
      case 'success': return '#10b981';
      case 'subscription':
      case 'account': return '#3b82f6';
      case 'security':
      case 'warning': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <TouchableOpacity 
      style={[styles.notifCard, !isRead && styles.unreadCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIconWrapper, { backgroundColor: getColor() + '15' }]}>
        <Ionicons name={getIcon() as any} size={22} color={getColor()} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardTime}>{getTimeAgo(createdAt)}</Text>
        </View>
        <Text style={styles.cardBody} numberOfLines={2}>{body}</Text>
      </View>
      {!isRead && <View style={styles.unreadBadge} />}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async (isRefreshing = false) => {
    if (!user?.uid) return;

    if (!isRefreshing && notifications.length === 0) {
      const cached = await storage.get(`notifications_${user.uid}`);
      if (cached) {
        setNotifications(cached);
        setLoading(false);
      }
    }

    if (isRefreshing) setRefreshing(true);
    else if (notifications.length === 0) setLoading(true);

    try {
      const response = await axios.get(`${Config.apiUrl}/api/notification/user`, {
        params: { userId: user.uid }
      });

      if (response.data.success) {
        const newList = response.data.data || [];
        if (JSON.stringify(newList) !== JSON.stringify(notifications)) {
          setNotifications(newList);
          await storage.set(`notifications_${user.uid}`, newList);
        }
      }
    } catch (err) {
      console.error("❌ [NOTIFICATIONS] Error fetching:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [user?.uid]);

  const { socket } = usePaymentSocket({
    onNotificationReceived: () => {
      console.log("🔥 [NOTIFICATIONS] New notification via Socket...");
      fetchNotifications(true);
    }
  });

  const markAsRead = async (notif: any) => {
    if (!user?.uid || isRead(notif)) return;

    // Mise à jour optimiste
    setLocalReadIds(prev => new Set(prev).add(notif.id));

    // Appel API silencieux
    try {
      if (socket) {
        socket.emit('isReadNotification', {
          userId: user.uid,
          notificationId: notif.id,
          notificationIdGroup: notif.idGroup
        });
      }
      
      // On pourrait aussi faire un PUT /api/notification/markAsRead ici si besoin
    } catch (err) {
      console.warn("⚠️ [NOTIFICATIONS] Error marking as read:", err);
    }
  };

  const isRead = (notif: any) => {
    if (localReadIds.has(notif.id)) return true;
    if (!user?.uid) return true;
    const readArray = Array.isArray(notif.isRead) ? notif.isRead : [];
    return readArray.includes(user.uid);
  };

  const unreadCount = notifications.filter(n => !isRead(n)).length;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundBlobs}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
      </View>

      <PageHeader 
        title="Mes Notifications" 
        subtitle={unreadCount > 0 ? `${unreadCount} nouvelles` : "À jour"} 
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchNotifications(true)} />
        }
      >
        {loading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        ) : notifications.length > 0 ? (
          <View style={styles.notifList}>
            {notifications.map((notif) => (
              <NotificationCard 
                key={notif.id} 
                {...notif} 
                isRead={isRead(notif)}
                onPress={() => markAsRead(notif)}
              />
            ))}
          </View>
        ) : (
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
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

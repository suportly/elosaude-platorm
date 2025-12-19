import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  Notification,
} from '../../store/services/api';
import { Colors } from '../../config/theme';
import { formatDate, formatTime } from '../../utils/formatters';

export default function NotificationsScreen({ navigation }: any) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data: notifications, isLoading, error, refetch } = useGetNotificationsQuery({
    is_read: filter === 'unread' ? false : undefined,
  });
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.notification_type) {
      case 'GUIDE':
        navigation.navigate('Guides');
        break;
      case 'REIMBURSEMENT':
        navigation.navigate('Reimbursements');
        break;
      case 'INVOICE':
        navigation.navigate('Invoices');
        break;
      case 'TAX_STATEMENT':
        navigation.navigate('TaxStatements');
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'GUIDE':
        return 'file-document-multiple';
      case 'REIMBURSEMENT':
        return 'cash-refund';
      case 'INVOICE':
        return 'file-download';
      case 'APPOINTMENT':
        return 'calendar-clock';
      case 'TAX_STATEMENT':
        return 'file-chart';
      case 'SYSTEM':
        return 'cog';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'HIGH') return Colors.error;

    switch (type) {
      case 'GUIDE':
        return Colors.warning;
      case 'REIMBURSEMENT':
        return Colors.primary;
      case 'INVOICE':
        return Colors.info;
      case 'APPOINTMENT':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const renderNotification = (notification: Notification) => {
    const iconColor = getNotificationColor(notification.notification_type, notification.priority);

    return (
      <TouchableOpacity
        key={notification.id}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.notificationCard,
            !notification.is_read && styles.unreadCard,
          ]}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Icon
                name={getNotificationIcon(notification.notification_type)}
                size={32}
                color={iconColor}
              />
              {!notification.is_read && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Text variant="titleSmall" style={[styles.title, !notification.is_read && styles.unreadTitle]}>
                  {notification.title}
                </Text>
                {notification.priority === 'HIGH' && (
                  <Chip
                    style={styles.priorityChip}
                    textStyle={styles.priorityText}
                    icon="alert"
                  >
                    Urgente
                  </Chip>
                )}
              </View>

              <Text variant="bodyMedium" style={styles.message} numberOfLines={2}>
                {notification.message}
              </Text>

              <View style={styles.footer}>
                <View style={styles.metaInfo}>
                  <Icon name="clock-outline" size={14} color={Colors.textSecondary} />
                  <Text variant="bodySmall" style={styles.timeText}>
                    {formatDate(notification.created_at)} às {formatTime(notification.created_at)}
                  </Text>
                </View>

                <IconButton
                  icon="delete-outline"
                  size={20}
                  iconColor={Colors.textSecondary}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const notificationsList = notifications?.results || [];
  const unreadCount = notificationsList.filter(n => !n.is_read).length || 0;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={Colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Erro ao carregar notificações
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={[
              styles.filterChip,
              filter === 'all' && { backgroundColor: Colors.primary },
            ]}
            textStyle={[
              styles.filterChipText,
              filter === 'all' && { color: '#FFFFFF' },
            ]}
          >
            Todas ({notificationsList.length})
          </Chip>
          <Chip
            selected={filter === 'unread'}
            onPress={() => setFilter('unread')}
            style={[
              styles.filterChip,
              filter === 'unread' && { backgroundColor: Colors.primary },
            ]}
            textStyle={[
              styles.filterChipText,
              filter === 'unread' && { color: '#FFFFFF' },
            ]}
          >
            Não Lidas ({unreadCount})
          </Chip>
        </View>

        {unreadCount > 0 && (
          <Button
            mode="text"
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
            compact
          >
            Marcar Todas como Lidas
          </Button>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notificationsList.length > 0 ? (
          notificationsList.map((notification) => renderNotification(notification))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="bell-off-outline" size={64} color={Colors.textLight} />
            <Text variant="titleMedium" style={styles.emptyText}>
              {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Você receberá notificações sobre guias, reembolsos e faturas
            </Text>
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: Colors.error,
  },
  retryButton: {
    marginTop: 16,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
  },
  markAllButton: {
    alignSelf: 'flex-start',
  },
  listContainer: {
    flex: 1,
  },
  notificationCard: {
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 1,
    backgroundColor: Colors.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  priorityChip: {
    height: 24,
    backgroundColor: Colors.error + '20',
  },
  priorityText: {
    fontSize: 10,
    color: Colors.error,
  },
  message: {
    marginBottom: 8,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    marginTop: 8,
    color: Colors.textLight,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

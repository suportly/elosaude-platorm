import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetProviderQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';

export default function ProviderDetailScreen({ route, navigation }: any) {
  const { providerId } = route.params;
  const { data: provider, isLoading, error, refetch } = useGetProviderQuery(providerId);

  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/\D/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phone: string) => {
    const phoneNumber = phone.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=55${phoneNumber}`);
  };

  const handleDirections = () => {
    if (provider?.latitude && provider?.longitude) {
      const scheme = Platform.select({
        ios: 'maps://app?daddr=',
        android: 'google.navigation:q=',
      });
      const url = Platform.select({
        ios: `${scheme}${provider.latitude},${provider.longitude}`,
        android: `${scheme}${provider.latitude},${provider.longitude}`,
      });
      Linking.openURL(url as string);
    }
  };

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case 'HOSPITAL':
        return 'Hospital';
      case 'CLINIC':
        return 'Clínica';
      case 'LABORATORY':
        return 'Laboratório';
      case 'DIAGNOSTIC_CENTER':
        return 'Centro Diagnóstico';
      case 'PHARMACY':
        return 'Farmácia';
      case 'PROFESSIONAL':
        return 'Profissional';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !provider) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={Colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Erro ao carregar prestador
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  const hasLocation = provider.latitude && provider.longitude;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Location Card */}
      {hasLocation && (
        <Card style={styles.locationCard}>
          <Card.Content>
            <View style={styles.locationHeader}>
              <Icon name="map-marker" size={24} color={Colors.primary} />
              <Text variant="titleMedium" style={styles.locationTitle}>
                Localização
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.locationText}>
              Latitude: {provider.latitude}
            </Text>
            <Text variant="bodyMedium" style={styles.locationText}>
              Longitude: {provider.longitude}
            </Text>
            <Button
              mode="contained"
              icon="directions"
              onPress={handleDirections}
              style={styles.directionsButton}
            >
              Ver no Mapa
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Provider Info Card */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon
                name={provider.provider_type === 'HOSPITAL' ? 'hospital-building' : 'medical-bag'}
                size={48}
                color={Colors.primary}
              />
            </View>
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall" style={styles.providerName}>
                {provider.name}
              </Text>
              {provider.trade_name && provider.trade_name !== provider.name && (
                <Text variant="bodyMedium" style={styles.tradeName}>
                  {provider.trade_name}
                </Text>
              )}
              <Chip
                style={styles.typeChip}
                textStyle={{ fontSize: 12 }}
                icon="hospital-marker"
              >
                {getProviderTypeLabel(provider.provider_type)}
              </Chip>
            </View>
          </View>

          {/* Rating */}
          {provider.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color={Colors.warning} />
              <Text variant="titleMedium" style={styles.ratingText}>
                {provider.rating.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.reviewsText}>
                ({provider.total_reviews} avaliações)
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Specialties */}
      {provider.specialties && provider.specialties.length > 0 && (
        <Card style={styles.section}>
          <Card.Title title="Especialidades" titleStyle={styles.sectionTitle} />
          <Card.Content>
            <View style={styles.specialtiesContainer}>
              {provider.specialties.map((specialty) => (
                <Chip
                  key={specialty.id}
                  style={styles.specialtyChip}
                  textStyle={{ fontSize: 13 }}
                  icon="medical-bag"
                >
                  {specialty.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Features */}
      <Card style={styles.section}>
        <Card.Title title="Recursos" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.featuresContainer}>
            {provider.accepts_telemedicine && (
              <View style={styles.featureItem}>
                <Icon name="video" size={24} color={Colors.success} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Atende Telemedicina
                </Text>
              </View>
            )}
            {provider.accepts_emergency && (
              <View style={styles.featureItem}>
                <Icon name="ambulance" size={24} color={Colors.error} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Atendimento de Emergência
                </Text>
              </View>
            )}
            {provider.is_active && (
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={24} color={Colors.success} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Credenciado Ativo
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Contact Information */}
      <Card style={styles.section}>
        <Card.Title title="Contato" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {provider.phone && (
            <View style={styles.contactRow}>
              <Icon name="phone" size={20} color={Colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {provider.phone}
              </Text>
            </View>
          )}

          {provider.city && provider.state && (
            <View style={styles.contactRow}>
              <Icon name="map-marker" size={20} color={Colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {provider.city} - {provider.state}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {provider.phone && (
          <>
            <Button
              mode="contained"
              icon="phone"
              style={styles.actionButton}
              onPress={() => handleCall(provider.phone)}
            >
              Ligar
            </Button>
            <Button
              mode="outlined"
              icon="whatsapp"
              style={styles.actionButton}
              onPress={() => handleWhatsApp(provider.phone)}
            >
              WhatsApp
            </Button>
          </>
        )}
        {hasLocation && (
          <Button
            mode="outlined"
            icon="directions"
            style={styles.actionButton}
            onPress={handleDirections}
          >
            Como Chegar
          </Button>
        )}
      </View>

      {/* Info Box */}
      <Card style={[styles.infoBox, { backgroundColor: Colors.info + '10' }]}>
        <Card.Content style={styles.infoBoxContent}>
          <Icon name="information-outline" size={24} color={Colors.info} />
          <Text variant="bodyMedium" style={[styles.infoBoxText, { color: Colors.info }]}>
            Antes de agendar, verifique se o prestador está credenciado para o seu plano e se
            aceita guias de sua categoria.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  locationCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationTitle: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  locationText: {
    marginBottom: 4,
    color: Colors.textSecondary,
  },
  directionsButton: {
    marginTop: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  headerLeft: {
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  providerName: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  tradeName: {
    color: Colors.textSecondary,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  ratingText: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  reviewsText: {
    color: Colors.textSecondary,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    marginBottom: 4,
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 8,
  },
  infoBox: {
    margin: 16,
    marginTop: 8,
  },
  infoBoxContent: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

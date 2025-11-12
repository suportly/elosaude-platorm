import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetGuideQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';
import { formatDate } from '../../utils/formatters';
import { downloadAndSharePDF, sanitizeFilename } from '../../utils/pdfDownloader';
import { API_URL } from '../../config/api';

export default function GuideDetailScreen({ route, navigation }: any) {
  const { guideId } = route.params;
  const { data: guide, isLoading, error, refetch } = useGetGuideQuery(guideId);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadGuide = async () => {
    if (!guide) {
      Alert.alert('Erro', 'Dados da guia não disponíveis');
      return;
    }

    setDownloading(true);

    try {
      const filename = sanitizeFilename(
        `guia_${guide.guide_number}_${guide.protocol_number}`
      );

      const pdfUrl = `${API_URL}/guides/guides/${guide.id}/pdf/`;
      await downloadAndSharePDF({
        url: pdfUrl,
        filename,
        onProgress: (progress) => {
          console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
        },
      });
    } catch (error) {
      console.error('Error downloading guide:', error);
      Alert.alert(
        'Erro ao Baixar',
        'Não foi possível baixar a guia. Tente novamente mais tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return Colors.success;
      case 'PENDING':
        return Colors.warning;
      case 'DENIED':
        return Colors.error;
      case 'EXPIRED':
        return Colors.textSecondary;
      case 'USED':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'Autorizada';
      case 'PENDING':
        return 'Pendente';
      case 'DENIED':
        return 'Negada';
      case 'EXPIRED':
        return 'Expirada';
      case 'USED':
        return 'Utilizada';
      default:
        return status;
    }
  };

  const getGuideTypeLabel = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'Consulta';
      case 'SP_SADT':
        return 'SP/SADT (Exames)';
      case 'HOSPITALIZATION':
        return 'Internação';
      case 'EMERGENCY':
        return 'Emergência';
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

  if (error || !guide) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={Colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Erro ao carregar guia
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  const statusColor = getStatusColor(guide.status);
  const isAuthorized = guide.status === 'AUTHORIZED';

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
      {/* Status Card */}
      <Card style={[styles.statusCard, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Icon name="file-document-multiple" size={48} color={statusColor} />
            <View style={styles.statusInfo}>
              <Text variant="headlineSmall" style={styles.guideNumber}>
                {guide.guide_number}
              </Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                textStyle={{ color: statusColor }}
              >
                {getStatusLabel(guide.status)}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Guide Information */}
      <Card style={styles.section}>
        <Card.Title title="Informações da Guia" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.infoRow}>
            <Icon name="file-document" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Tipo:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {getGuideTypeLabel(guide.guide_type)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="card-account-details" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Protocolo:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {guide.protocol_number}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Solicitação:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {formatDate(guide.request_date)}
            </Text>
          </View>

          {guide.authorization_date && (
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={20} color={Colors.success} />
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Autorização:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {formatDate(guide.authorization_date)}
              </Text>
            </View>
          )}

          {guide.expiry_date && (
            <View style={styles.infoRow}>
              <Icon name="clock-alert-outline" size={20} color={Colors.warning} />
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Validade:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {formatDate(guide.expiry_date)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Beneficiary and Provider */}
      <Card style={styles.section}>
        <Card.Title title="Paciente e Prestador" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.infoRow}>
            <Icon name="account" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Beneficiário:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {guide.beneficiary_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="hospital-building" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Prestador:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {guide.provider_name}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Clinical Information */}
      {(guide.diagnosis || guide.observations) && (
        <Card style={styles.section}>
          <Card.Title title="Informações Clínicas" titleStyle={styles.sectionTitle} />
          <Card.Content>
            {guide.diagnosis && (
              <>
                <Text variant="titleSmall" style={styles.clinicalTitle}>
                  Diagnóstico
                </Text>
                <Text variant="bodyMedium" style={styles.clinicalText}>
                  {guide.diagnosis}
                </Text>
              </>
            )}

            {guide.observations && (
              <>
                <Text variant="titleSmall" style={[styles.clinicalTitle, { marginTop: 16 }]}>
                  Observações
                </Text>
                <Text variant="bodyMedium" style={styles.clinicalText}>
                  {guide.observations}
                </Text>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Actions */}
      {isAuthorized && (
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            icon="download"
            style={styles.actionButton}
            onPress={handleDownloadGuide}
            loading={downloading}
            disabled={downloading}
          >
            {downloading ? 'Baixando...' : 'Baixar Guia (PDF)'}
          </Button>
          <Button
            mode="outlined"
            icon="share-variant"
            style={styles.actionButton}
            onPress={handleDownloadGuide}
            loading={downloading}
            disabled={downloading}
          >
            {downloading ? 'Compartilhando...' : 'Compartilhar'}
          </Button>
        </View>
      )}

      {/* Info Box */}
      {isAuthorized && guide.expiry_date && (
        <Card style={[styles.infoBox, { backgroundColor: Colors.success + '10' }]}>
          <Card.Content style={styles.infoBoxContent}>
            <Icon name="information-outline" size={24} color={Colors.success} />
            <Text variant="bodyMedium" style={[styles.infoBoxText, { color: Colors.success }]}>
              Guia autorizada! Apresente este documento ao prestador junto com sua carteirinha
              digital antes da data de validade.
            </Text>
          </Card.Content>
        </Card>
      )}

      {guide.status === 'DENIED' && (
        <Card style={[styles.infoBox, { backgroundColor: Colors.error + '10' }]}>
          <Card.Content style={styles.infoBoxContent}>
            <Icon name="alert-circle-outline" size={24} color={Colors.error} />
            <Text variant="bodyMedium" style={[styles.infoBoxText, { color: Colors.error }]}>
              Guia negada. Entre em contato com nossa central de atendimento para mais
              informações.
            </Text>
          </Card.Content>
        </Card>
      )}

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
  statusCard: {
    margin: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusInfo: {
    flex: 1,
    gap: 8,
  },
  guideNumber: {
    fontWeight: 'bold',
  },
  statusChip: {
    alignSelf: 'flex-start',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    color: Colors.textSecondary,
    minWidth: 100,
  },
  infoValue: {
    flex: 1,
    fontWeight: '500',
  },
  clinicalTitle: {
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  clinicalText: {
    lineHeight: 22,
    color: Colors.text,
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

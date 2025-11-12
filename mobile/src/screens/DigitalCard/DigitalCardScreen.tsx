import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, FlatList, RefreshControl, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Divider, Badge, Chip } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useGetDigitalCardQuery, useGetBeneficiaryQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';
import { downloadAndSharePDF, sanitizeFilename } from '../../utils/pdfDownloader';
import { API_URL } from '../../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 8; // Padding between cards
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side
const CARD_ITEM_WIDTH = CARD_WIDTH + (CARD_PADDING * 2); // Total width including padding

const DigitalCardScreen = () => {
  const { data: cardDataArray, isLoading: isLoadingCard, error: cardError, refetch: refetchCard } = useGetDigitalCardQuery();
  const { data: beneficiaryData, isLoading: isLoadingBeneficiary, error: beneficiaryError, refetch: refetchBeneficiary } = useGetBeneficiaryQuery();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showQR, setShowQR] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCard(), refetchBeneficiary()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!cardData || !beneficiaryData) {
      Alert.alert('Erro', 'Dados da carteirinha não disponíveis');
      return;
    }

    setDownloading(true);

    try {
      // Generate filename with beneficiary name and card number
      const filename = sanitizeFilename(
        `carteirinha_${beneficiaryData.full_name}_${cardData.card_number}`
      );

      const pdfUrl = `${API_URL}/beneficiaries/digital-cards/${cardData.id}/pdf/`;
      await downloadAndSharePDF({
        url: pdfUrl,
        filename,
        onProgress: (progress) => {
          console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
        },
      });
    } catch (error) {
      console.error('Error downloading card:', error);
      Alert.alert(
        'Erro ao Baixar',
        'Não foi possível baixar a carteirinha. Tente novamente mais tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloading(false);
    }
  };

  // Sort cards: active first, then by issue date (newest first)
  const sortedCards = cardDataArray
    ? [...cardDataArray].sort((a, b) => {
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
      })
    : [];

  const cardData = sortedCards[currentCardIndex];

  const isLoading = isLoadingCard || isLoadingBeneficiary;
  const error = cardError || beneficiaryError;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Paragraph style={styles.loadingText}>Carregando carteirinha digital...</Paragraph>
      </View>
    );
  }

  if (error || !sortedCards || sortedCards.length === 0 || !beneficiaryData) {
    return (
      <View style={styles.centerContainer}>
        <Paragraph style={styles.errorText}>
          {sortedCards?.length === 0
            ? 'Nenhuma carteirinha digital encontrada'
            : 'Não foi possível carregar a carteirinha digital'}
        </Paragraph>
        <Button mode="contained" onPress={() => { refetchCard(); refetchBeneficiary(); }}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_ITEM_WIDTH);
    if (index !== currentCardIndex && index >= 0 && index < sortedCards.length) {
      setCurrentCardIndex(index);
    }
  };

  const renderCard = ({ item, index }: { item: any; index: number }) => {
    const isActive = item.is_active;
    const issueDate = item.issue_date ? new Date(item.issue_date).toLocaleDateString('pt-BR') : 'N/A';
    const expiryDate = item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-BR') : 'N/A';

    return (
      <View style={[styles.cardContainer, { width: CARD_ITEM_WIDTH }]}>
        <Card
          style={[
            styles.card,
            !isActive && styles.inactiveCard
          ]}
          elevation={4}
        >
          <Card.Content>
            {/* Card Status Badge */}
            <View style={styles.badgeContainer}>
              {isActive ? (
                <Chip icon="check-circle" style={styles.activeBadge} textStyle={styles.badgeText}>
                  ATIVA
                </Chip>
              ) : (
                <Chip icon="information" style={styles.inactiveBadge} textStyle={styles.badgeText}>
                  INATIVA
                </Chip>
              )}
              <Chip style={styles.versionChip} textStyle={styles.versionText}>
                Versão {item.version}
              </Chip>
            </View>

            {/* Header with Logo */}
            <View style={styles.cardHeader}>
              <Title style={styles.planName}>{beneficiaryData.health_plan_name || 'Elosaúde'}</Title>
            </View>

            <Divider style={styles.divider} />

            {/* Beneficiary Info */}
            <View style={styles.infoSection}>
              <Paragraph style={styles.label}>Nome</Paragraph>
              <Title style={styles.value}>{beneficiaryData.full_name}</Title>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Matrícula</Paragraph>
                <Paragraph style={styles.value}>{beneficiaryData.registration_number}</Paragraph>
              </View>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Plano</Paragraph>
                <Paragraph style={styles.value}>{beneficiaryData.health_plan_name}</Paragraph>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Data de Emissão</Paragraph>
                <Paragraph style={styles.value}>{issueDate}</Paragraph>
              </View>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Validade</Paragraph>
                <Paragraph style={styles.value}>{expiryDate}</Paragraph>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Número do Cartão</Paragraph>
                <Paragraph style={styles.value}>{item.card_number || 'N/A'}</Paragraph>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* QR Code */}
            {showQR && item.qr_code_data && (
              <View style={styles.qrContainer}>
                <QRCode value={item.qr_code_data} size={200} />
                <Paragraph style={styles.qrLabel}>Apresente este QR code nos prestadores credenciados</Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.content}>
        {/* Card Counter */}
        {sortedCards.length > 1 && (
          <View style={styles.counterContainer}>
            <Paragraph style={styles.counterText}>
              Carteirinha {currentCardIndex + 1} de {sortedCards.length}
            </Paragraph>
          </View>
        )}

        {/* Digital Card Carousel */}
        <FlatList
          ref={flatListRef}
          data={sortedCards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={CARD_ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
        />

        {/* Page Indicators */}
        {sortedCards.length > 1 && (
          <View style={styles.indicatorContainer}>
            {sortedCards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentCardIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            icon="qrcode"
            onPress={() => setShowQR(!showQR)}
            style={styles.button}
          >
            {showQR ? 'Ocultar QR Code' : 'Mostrar QR Code'}
          </Button>
          <Button
            mode="contained"
            icon="download"
            onPress={handleDownloadCard}
            loading={downloading}
            disabled={downloading}
            style={styles.button}
          >
            {downloading ? 'Baixando...' : 'Baixar Carteirinha'}
          </Button>
        </View>

        {/* Additional Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Informações Importantes</Title>
            <Paragraph style={styles.infoParagraph}>
              • Sempre apresente esta carteirinha digital nos prestadores
            </Paragraph>
            <Paragraph style={styles.infoParagraph}>
              • Mantenha seus dados cadastrais atualizados
            </Paragraph>
            <Paragraph style={styles.infoParagraph}>
              • Em caso de perda ou roubo, entre em contato imediatamente
            </Paragraph>
            <Paragraph style={styles.infoParagraph}>
              • Esta carteirinha é pessoal e intransferível
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  carouselContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cardContainer: {
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  inactiveCard: {
    opacity: 0.75,
    backgroundColor: '#f9f9f9',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#9E9E9E',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  versionChip: {
    backgroundColor: '#E3F2FD',
  },
  versionText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  divider: {
    marginVertical: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrLabel: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#1976D2',
    width: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976D2',
  },
  infoParagraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    color: '#555',
  },
});

export default DigitalCardScreen;

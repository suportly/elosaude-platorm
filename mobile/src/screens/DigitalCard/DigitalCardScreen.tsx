import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, Paragraph, Title } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../config/theme';
import { useGetOracleCardsQuery } from '../../store/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 8;
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_ITEM_WIDTH = CARD_WIDTH + (CARD_PADDING * 2);

const DigitalCardScreen = () => {
  const { data: oracleCards, isLoading, error, refetch } = useGetOracleCardsQuery();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showQR, setShowQR] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Combine all Oracle cards into a single array for the main carousel
  const allCards = oracleCards
    ? [
        ...oracleCards.carteirinha.map((card: any) => ({ ...card, _type: 'CARTEIRINHA' })),
        ...oracleCards.unimed.map((card: any) => ({ ...card, _type: 'UNIMED' })),
        ...oracleCards.reciprocidade.map((card: any) => ({ ...card, _type: 'RECIPROCIDADE' })),
      ]
    : [];

  const currentCard = allCards[currentCardIndex];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Paragraph style={styles.loadingText}>Carregando carteirinhas...</Paragraph>
      </View>
    );
  }

  if (error || !oracleCards || allCards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Paragraph style={styles.errorText}>
          {allCards.length === 0
            ? 'Nenhuma carteirinha encontrada'
            : 'Não foi possível carregar as carteirinhas'}
        </Paragraph>
        <Button mode="contained" onPress={refetch}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_ITEM_WIDTH);
    if (index !== currentCardIndex && index >= 0 && index < allCards.length) {
      setCurrentCardIndex(index);
    }
  };

  const renderCard = ({ item }: { item: any }) => {
    const cardType = item._type;
    let cardInfo: any = {};

    // Extract card information based on type
    if (cardType === 'CARTEIRINHA') {
      cardInfo = {
        title: 'Elosaúde',
        name: item.NOME_DO_BENEFICIARIO || item.NM_SOCIAL,
        registration: item.MATRICULA,
        plan: item.PRIMARIO || item.SEGMENTACAO,
        cpf: item.NR_CPF ? String(item.NR_CPF).padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '',
        cns: item.NR_CNS,
        birthDate: item.NASCTO,
        cardNumber: item.MATRICULA,
        company: item.EMPRESA,
        contractType: item.CONTRATACAO,
        validity: item.VALIDADE,
        layout: item.LAYOUT,
        segmentation: item.SEGMENTACAO,
      };
    } else if (cardType === 'UNIMED') {
      cardInfo = {
        title: 'Unimed',
        name: item.NOME_DO_BENEFICIARIO || item.nm_social,
        registration: item.MATRICULA_UNIMED,
        plan: item.PLANO || item.SEGMENTACAO,
        cpf: item.CPF ? String(item.CPF).padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '',
        cns: item.NR_CNS,
        birthDate: item.nascto,
        cardNumber: item.MATRICULA_UNIMED,
        coverage: item.ABRANGENCIA,
        accommodation: item.ACOMODACAO,
        network: item.Rede_Atendimento,
        validity: item.Validade,
        segmentation: item.SEGMENTACAO,
      };
    } else { // RECIPROCIDADE
      cardInfo = {
        title: item.PRESTADOR_RECIPROCIDADE || 'Reciprocidade',
        name: item.NOME_BENEFICIARIO || item.NM_SOCIAL,
        registration: item.CD_MATRICULA_RECIPROCIDADE,
        plan: item.PLANO_ELOSAUDE,
        cpf: item.NR_CPF ? String(item.NR_CPF).padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '',
        cns: item.NR_CNS,
        birthDate: item.NASCTO,
        cardNumber: item.CD_MATRICULA_RECIPROCIDADE,
        provider: item.PRESTADOR_RECIPROCIDADE,
        adhesionDate: item.DT_ADESAO,
        validity: item.DT_VALIDADE_CARTEIRA,
      };
    }

    // Generate QR code data with card information
    const qrData = JSON.stringify({
      type: cardType,
      name: cardInfo.name,
      registration: cardInfo.registration,
      cpf: cardInfo.cpf,
      cns: cardInfo.cns,
      cardNumber: cardInfo.cardNumber,
    });

    return (
      <View style={[styles.cardContainer, { width: CARD_ITEM_WIDTH }]}>
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            {/* Card Type Badge */}
            {/* Header */}
            <View style={styles.cardHeader}>
              <Title style={styles.planName}>{cardInfo.title}</Title>
            </View>

            <Divider style={styles.divider} />

            {/* Beneficiary Info */}
            <View style={styles.infoSection}>
              <Paragraph style={styles.label}>Nome</Paragraph>
              <Title style={styles.value}>{cardInfo.name}</Title>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Matrícula</Paragraph>
                <Paragraph style={styles.value}>{cardInfo.registration || 'N/A'}</Paragraph>
              </View>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Plano</Paragraph>
                <Paragraph style={styles.value}>{cardInfo.plan || 'N/A'}</Paragraph>
              </View>
            </View>

            {cardInfo.cpf && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Paragraph style={styles.label}>CPF</Paragraph>
                  <Paragraph style={styles.value}>{cardInfo.cpf}</Paragraph>
                </View>
                <View style={styles.infoItem}>
                  <Paragraph style={styles.label}>Data de Nascimento</Paragraph>
                  <Paragraph style={styles.value}>{cardInfo.birthDate || 'N/A'}</Paragraph>
                </View>
              </View>
            )}

            {cardInfo.cns && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Paragraph style={styles.label}>CNS</Paragraph>
                  <Paragraph style={styles.value}>{cardInfo.cns}</Paragraph>
                </View>
              </View>
            )}

            {/* Type-specific information */}
            {cardType === 'UNIMED' && (
              <>
                {cardInfo.coverage && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Paragraph style={styles.label}>Abrangência</Paragraph>
                      <Paragraph style={styles.value}>{cardInfo.coverage}</Paragraph>
                    </View>
                    {cardInfo.accommodation && (
                      <View style={styles.infoItem}>
                        <Paragraph style={styles.label}>Acomodação</Paragraph>
                        <Paragraph style={styles.value}>{cardInfo.accommodation}</Paragraph>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {cardType === 'RECIPROCIDADE' && cardInfo.provider && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Paragraph style={styles.label}>Prestador</Paragraph>
                  <Paragraph style={styles.value}>{cardInfo.provider}</Paragraph>
                </View>
              </View>
            )}

            {cardInfo.segmentation && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Paragraph style={styles.label}>Segmentação</Paragraph>
                  <Paragraph style={styles.value}>{cardInfo.segmentation}</Paragraph>
                </View>
              </View>
            )}

            <Divider style={styles.divider} />

            {/* QR Code */}
            {showQR && (
              <View style={styles.qrContainer}>
                <QRCode value={qrData} size={200} />
                <Paragraph style={styles.qrLabel}>
                  Apresente este QR code nos prestadores credenciados
                </Paragraph>
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
        <View style={styles.counterContainer}>
          <Paragraph style={styles.counterText}>
            Carteirinha {currentCardIndex + 1} de {allCards.length}
          </Paragraph>
          <Paragraph style={styles.summaryText}>
            Total: {oracleCards.total_cards} carteirinha{oracleCards.total_cards !== 1 ? 's' : ''}
          </Paragraph>
        </View>

        {/* Digital Card Carousel */}
        <FlatList
          ref={flatListRef}
          data={allCards}
          renderItem={renderCard}
          keyExtractor={(item, index) => `${item._type}-${index}`}
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
        {allCards.length > 1 && (
          <View style={styles.indicatorContainer}>
            {allCards.map((_, index) => (
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
        </View>

        {/* Additional Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Informações Importantes</Title>
            <Paragraph style={styles.infoParagraph}>
              • Sempre apresente a carteirinha adequada nos prestadores
            </Paragraph>
            <Paragraph style={styles.infoParagraph}>
              • Mantenha seus dados cadastrais atualizados
            </Paragraph>
            <Paragraph style={styles.infoParagraph}>
              • Em caso de perda ou roubo, entre em contato imediatamente
            </Paragraph>
            <Paragraph style={styles.infoParagraph}>
              • Estas carteirinhas são pessoais e intransferíveis
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
    color: Colors.primary,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flex: 1,
    marginRight: 8,
  },
  badgeElosaude: {
    backgroundColor: Colors.primary,
  },
  badgeUnimed: {
    backgroundColor: '#00A859',
  },
  badgeReciprocidade: {
    backgroundColor: '#FF6B35',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
    width: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    maxWidth: 200,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
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
    color: Colors.primary,
  },
  infoParagraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    color: '#555',
  },
});

export default DigitalCardScreen;

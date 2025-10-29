import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Divider } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useGetDigitalCardQuery, useGetBeneficiaryQuery } from '../../store/services/api';

const DigitalCardScreen = () => {
  const { data: cardDataArray, isLoading: isLoadingCard, error: cardError, refetch: refetchCard } = useGetDigitalCardQuery();
  const { data: beneficiaryData, isLoading: isLoadingBeneficiary, error: beneficiaryError, refetch: refetchBeneficiary } = useGetBeneficiaryQuery();

  // Find the first active card from the array
  const cardData = cardDataArray?.find(card => card.is_active);

  const [showQR, setShowQR] = useState(true);

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

  if (error || !cardData || !beneficiaryData) {
    return (
      <View style={styles.centerContainer}>
        <Paragraph style={styles.errorText}>Não foi possível carregar a carteirinha digital</Paragraph>
        <Button mode="contained" onPress={() => { refetchCard(); refetchBeneficiary(); }}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Digital Card Display */}
        <Card style={styles.card} elevation={4}>
          <Card.Content>
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
                <Paragraph style={styles.label}>Validade</Paragraph>
                <Paragraph style={styles.value}>
                  {cardData.expiry_date
                    ? new Date(cardData.expiry_date).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </Paragraph>
              </View>
              <View style={styles.infoItem}>
                <Paragraph style={styles.label}>Número do Cartão</Paragraph>
                <Paragraph style={styles.value}>{cardData.card_number || 'N/A'}</Paragraph>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* QR Code */}
            {showQR && cardData.qr_code_data && (
              <View style={styles.qrContainer}>
                <QRCode value={cardData.qr_code_data} size={200} />
                <Paragraph style={styles.qrLabel}>Apresente este QR code nos prestadores credenciados</Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

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
            onPress={() => {
              // TODO: Implement download/share functionality
              console.log('Download card');
            }}
            style={styles.button}
          >
            Baixar Carteirinha
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
    padding: 16,
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
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
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

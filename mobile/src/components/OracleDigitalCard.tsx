/**
 * OracleDigitalCard Component
 * Displays Oracle database cards (Elosaúde, Unimed, Reciprocidade)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, Divider } from 'react-native-paper';
import { OracleCardType, type OracleCarteirinha, type OracleUnimed, type OracleReciprocidade } from '../types/oracle';
import { Colors } from '../config/theme';

interface OracleDigitalCardProps {
  type: OracleCardType;
  data: OracleCarteirinha | OracleUnimed | OracleReciprocidade;
}

export const OracleDigitalCard: React.FC<OracleDigitalCardProps> = ({ type, data }) => {
  const getCardColor = () => {
    switch (type) {
      case OracleCardType.ELOSAUDE:
        return '#1976D2'; // Blue
      case OracleCardType.UNIMED:
        return '#00AB4E'; // Green
      case OracleCardType.RECIPROCIDADE:
        return '#F57C00'; // Orange
      default:
        return '#1976D2';
    }
  };

  const getCardTitle = () => {
    switch (type) {
      case OracleCardType.ELOSAUDE:
        return 'Carteirinha Elosaúde';
      case OracleCardType.UNIMED:
        return 'Carteirinha Unimed';
      case OracleCardType.RECIPROCIDADE:
        return 'Carteirinha Reciprocidade';
      default:
        return 'Carteirinha';
    }
  };

  const renderElosaude = (card: OracleCarteirinha) => (
    <>
      <View style={styles.infoSection}>
        <Paragraph style={styles.label}>Nome</Paragraph>
        <Title style={styles.value}>{card.NM_SOCIAL || card.NOME_DO_BENEFICIARIO}</Title>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Matrícula</Paragraph>
          <Paragraph style={styles.value}>{card.MATRICULA}</Paragraph>
        </View>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Matrícula Soul</Paragraph>
          <Paragraph style={styles.value}>{card.MATRICULA_SOUL}</Paragraph>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Plano</Paragraph>
          <Paragraph style={styles.value}>{card.PRIMARIO}</Paragraph>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Segmentação</Paragraph>
          <Paragraph style={styles.value}>{card.SEGMENTACAO}</Paragraph>
        </View>
      </View>

      {card.NR_CNS && (
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Paragraph style={styles.label}>CNS</Paragraph>
            <Paragraph style={styles.value}>{card.NR_CNS}</Paragraph>
          </View>
          <View style={styles.infoItem}>
            <Paragraph style={styles.label}>Data Nascimento</Paragraph>
            <Paragraph style={styles.value}>{card.NASCTO}</Paragraph>
          </View>
        </View>
      )}
    </>
  );

  const renderUnimed = (card: OracleUnimed) => (
    <>
      {card.NOME && (
        <View style={styles.infoSection}>
          <Paragraph style={styles.label}>Nome</Paragraph>
          <Title style={styles.value}>{card.NOME}</Title>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Matrícula Unimed</Paragraph>
          <Paragraph style={styles.value}>{card.MATRICULA_UNIMED}</Paragraph>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Plano</Paragraph>
          <Paragraph style={styles.value}>{card.PLANO}</Paragraph>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Abrangência</Paragraph>
          <Paragraph style={styles.value}>{card.ABRANGENCIA}</Paragraph>
        </View>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Acomodação</Paragraph>
          <Paragraph style={styles.value}>{card.ACOMODACAO}</Paragraph>
        </View>
      </View>

      {card.Validade && (
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Paragraph style={styles.label}>Validade</Paragraph>
            <Paragraph style={styles.value}>
              {new Date(card.Validade).toLocaleDateString('pt-BR')}
            </Paragraph>
          </View>
        </View>
      )}
    </>
  );

  const renderReciprocidade = (card: OracleReciprocidade) => (
    <>
      {card.NOME_BENEFICIARIO && (
        <View style={styles.infoSection}>
          <Paragraph style={styles.label}>Nome</Paragraph>
          <Title style={styles.value}>{card.NOME_BENEFICIARIO}</Title>
        </View>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Matrícula</Paragraph>
          <Paragraph style={styles.value}>{card.CD_MATRICULA_RECIPROCIDADE}</Paragraph>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Prestador</Paragraph>
          <Paragraph style={styles.value}>{card.PRESTADOR_RECIPROCIDADE}</Paragraph>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Paragraph style={styles.label}>Plano Elosaúde</Paragraph>
          <Paragraph style={styles.value}>{card.PLANO_ELOSAUDE}</Paragraph>
        </View>
      </View>

      {card.DT_VALIDADE_CARTEIRA && (
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Paragraph style={styles.label}>Validade</Paragraph>
            <Paragraph style={styles.value}>
              {new Date(card.DT_VALIDADE_CARTEIRA).toLocaleDateString('pt-BR')}
            </Paragraph>
          </View>
        </View>
      )}
    </>
  );

  const renderContent = () => {
    switch (type) {
      case OracleCardType.ELOSAUDE:
        return renderElosaude(data as OracleCarteirinha);
      case OracleCardType.UNIMED:
        return renderUnimed(data as OracleUnimed);
      case OracleCardType.RECIPROCIDADE:
        return renderReciprocidade(data as OracleReciprocidade);
      default:
        return null;
    }
  };

  return (
    <Card style={styles.card} elevation={4}>
      <Card.Content>
        {/* Card Header with Type Badge */}
        <View style={styles.badgeContainer}>
          <Chip
            icon="card-account-details"
            style={[styles.typeBadge, { backgroundColor: getCardColor() }]}
            textStyle={styles.badgeText}
          >
            {getCardTitle()}
          </Chip>
          <Chip icon="check-circle" style={styles.activeBadge} textStyle={styles.badgeText}>
            ATIVA
          </Chip>
        </View>

        <Divider style={styles.divider} />

        {/* Card Content */}
        {renderContent()}

        <Divider style={styles.divider} />

        {/* Footer Note */}
        <Paragraph style={styles.footerNote}>
          Apresente esta carteirinha nos prestadores credenciados
        </Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: Colors.primary.main,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E0E0E0',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

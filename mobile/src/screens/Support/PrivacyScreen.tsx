import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Colors } from '../../config/theme';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Política de Privacidade</Title>
          <Paragraph style={styles.date}>Última atualização: 28 de Outubro de 2025</Paragraph>

          <Title style={styles.sectionTitle}>1. Introdução</Title>
          <Paragraph style={styles.paragraph}>
            A Elosaúde está comprometida em proteger sua privacidade e seus dados pessoais. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </Paragraph>

          <Title style={styles.sectionTitle}>2. Dados Coletados</Title>
          <Paragraph style={styles.paragraph}>
            Coletamos os seguintes tipos de dados:{'\n\n'}
            • Dados Cadastrais: nome, CPF, data de nascimento, endereço, telefone, e-mail{'\n'}
            • Dados de Saúde: histórico de consultas, exames, procedimentos, guias TISS{'\n'}
            • Dados de Uso: logs de acesso, interações no aplicativo{'\n'}
            • Dados de Localização: apenas quando necessário para localizar prestadores próximos
          </Paragraph>

          <Title style={styles.sectionTitle}>3. Finalidade do Tratamento</Title>
          <Paragraph style={styles.paragraph}>
            Utilizamos seus dados para:{'\n\n'}
            • Prestação de serviços de plano de saúde{'\n'}
            • Processamento de guias e reembolsos{'\n'}
            • Comunicação sobre autorizações e notificações{'\n'}
            • Melhoria dos nossos serviços{'\n'}
            • Cumprimento de obrigações legais e regulatórias
          </Paragraph>

          <Title style={styles.sectionTitle}>4. Compartilhamento de Dados</Title>
          <Paragraph style={styles.paragraph}>
            Seus dados podem ser compartilhados com:{'\n\n'}
            • Prestadores de saúde da rede credenciada{'\n'}
            • Autoridades reguladoras (ANS, ANVISA){'\n'}
            • Empresas contratantes (no caso de plano empresarial){'\n'}
            • Fornecedores de serviços (sob contrato de confidencialidade)
          </Paragraph>

          <Title style={styles.sectionTitle}>5. Segurança</Title>
          <Paragraph style={styles.paragraph}>
            Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo:{'\n\n'}
            • Criptografia de dados em trânsito e em repouso{'\n'}
            • Controles de acesso rigorosos{'\n'}
            • Monitoramento contínuo de segurança{'\n'}
            • Auditorias periódicas{'\n'}
            • Treinamento de equipe em proteção de dados
          </Paragraph>

          <Title style={styles.sectionTitle}>6. Seus Direitos</Title>
          <Paragraph style={styles.paragraph}>
            Você tem direito a:{'\n\n'}
            • Confirmação e acesso aos seus dados{'\n'}
            • Correção de dados incompletos ou desatualizados{'\n'}
            • Anonimização, bloqueio ou eliminação de dados{'\n'}
            • Portabilidade dos dados{'\n'}
            • Revogação do consentimento{'\n'}
            • Informação sobre compartilhamento
          </Paragraph>

          <Title style={styles.sectionTitle}>7. Retenção de Dados</Title>
          <Paragraph style={styles.paragraph}>
            Mantemos seus dados pelo período necessário para cumprir as finalidades descritas ou conforme exigido por lei (mínimo de 20 anos para dados de saúde, conforme regulamentação do CFM).
          </Paragraph>

          <Title style={styles.sectionTitle}>8. Cookies e Tecnologias</Title>
          <Paragraph style={styles.paragraph}>
            Utilizamos tecnologias de rastreamento para melhorar a experiência do usuário. Você pode gerenciar suas preferências nas configurações do dispositivo.
          </Paragraph>

          <Title style={styles.sectionTitle}>9. Alterações nesta Política</Title>
          <Paragraph style={styles.paragraph}>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do aplicativo ou por e-mail.
          </Paragraph>

          <Title style={styles.sectionTitle}>10. Contato - DPO</Title>
          <Paragraph style={styles.paragraph}>
            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato com nosso Encarregado de Proteção de Dados:{'\n\n'}
            E-mail: dpo@elosaude.com.br{'\n'}
            Telefone: 0800 777 1234
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
});

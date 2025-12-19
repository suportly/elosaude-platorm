import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Divider, Card, Title, Paragraph, Avatar, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useColors } from '../../config/ThemeContext';
import { Typography, Spacing } from '../../config/theme';

const MoreScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colors = useColors();
  const { user, beneficiary } = useSelector((state: RootState) => state.auth);

  const handleSair = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface.background }]}>
      {/* User Profile Card */}
      <Card style={[styles.profileCard, { backgroundColor: colors.surface.card }]} elevation={3}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={64}
              label={user?.first_name?.charAt(0) || 'U'}
              style={[styles.avatar, { backgroundColor: colors.primary.main }]}
            />
            <View style={styles.profileInfo}>
              <Title style={[styles.userName, { color: colors.text.primary }]}>
                {user?.first_name} {user?.last_name}
              </Title>
              <Paragraph style={[styles.userInfo, { color: colors.text.secondary }]}>
                {beneficiary?.registration_number || 'N/A'}
              </Paragraph>
              <Paragraph style={[styles.userInfo, { color: colors.text.secondary }]}>{user?.email || 'N/A'}</Paragraph>
            </View>
          </View>
          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => navigation.navigate('Profile' as never)}
            style={styles.editButton}
            textColor={colors.primary.main}
          >
            Editar Perfil
          </Button>
        </Card.Content>
      </Card>

      {/* Account Section */}
      <View style={[styles.section, { backgroundColor: colors.surface.card }]}>
        <List.Section>
          <List.Subheader style={[styles.subheader, { color: colors.text.secondary }]}>Account</List.Subheader>
          <List.Item
            title="Meu Perfil"
            description="Visualizar e editar suas informações pessoais"
            left={(props) => <List.Icon {...props} icon="account" color={colors.primary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Profile' as never)}
            accessibilityLabel="Meu Perfil"
            accessibilityHint="Permite visualizar e editar suas informações pessoais"
          />
          <Divider />
          <List.Item
            title="Dependentes"
            description="Gerenciar seus dependentes"
            left={(props) => <List.Icon {...props} icon="account-multiple" color={colors.primary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Dependents' as never)}
            accessibilityLabel="Dependentes"
            accessibilityHint="Permite gerenciar seus dependentes"
          />
          <Divider />
          <List.Item
            title="Alterar Senha"
            description="Atualizar sua senha"
            left={(props) => <List.Icon {...props} icon="lock-reset" color={colors.primary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePassword' as never)}
            accessibilityLabel="Alterar Senha"
            accessibilityHint="Permite atualizar sua senha de forma segura"
          />
        </List.Section>
      </View>

      {/* Health Section */}
      <View style={[styles.section, { backgroundColor: colors.surface.card }]}>
        <List.Section>
          <List.Subheader style={[styles.subheader, { color: colors.text.secondary }]}>Health</List.Subheader>
          <List.Item
            title="Meus Registros de Saúde"
            description="Ver seu histórico médico"
            left={(props) => <List.Icon {...props} icon="file-document-multiple" color={colors.secondary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('HealthRecords' as never)}
            accessibilityLabel="Meus Registros de Saúde"
            accessibilityHint="Permite visualizar seu histórico médico"
          />
          <Divider />
          <List.Item
            title="Cartão de Vacinação"
            description="Ver seu histórico de vacinações"
            left={(props) => <List.Icon {...props} icon="needle" color={colors.secondary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('VaccinationCard' as never)}
            accessibilityLabel="Cartão de Vacinação"
            accessibilityHint="Permite visualizar seu histórico de vacinações"
          />
        </List.Section>
      </View>

      {/* Plan Section */}
      <View style={[styles.section, { backgroundColor: colors.surface.card }]}>
        <List.Section>
          <List.Subheader style={[styles.subheader, { color: colors.text.secondary }]}>Plan</List.Subheader>
          <List.Item
            title="Detalhes do Plano"
            description="Ver cobertura e benefícios do seu plano"
            left={(props) => <List.Icon {...props} icon="shield-check" color={colors.feedback.warning} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('PlanDetails' as never)}
            accessibilityLabel="Detalhes do Plano"
            accessibilityHint="Permite visualizar cobertura e benefícios do seu plano"
          />
          <Divider />
          <List.Item
            title="Faturas"
            description="Ver e baixar faturas"
            left={(props) => <List.Icon {...props} icon="file-document" color={colors.feedback.warning} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Invoices' as never)}
            accessibilityLabel="Faturas"
            accessibilityHint="Permite visualizar e baixar suas faturas"
          />
          <Divider />
          <List.Item
            title="Formas de Pagamento"
            description="Gerenciar opções de pagamento"
            left={(props) => <List.Icon {...props} icon="credit-card" color={colors.feedback.warning} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.')}
            accessibilityLabel="Formas de Pagamento"
            accessibilityHint="Funcionalidade para gerenciar opções de pagamento em breve"
          />
        </List.Section>
      </View>

      {/* Support Section */}
      <View style={[styles.section, { backgroundColor: colors.surface.card }]}>
        <List.Section>
          <List.Subheader style={[styles.subheader, { color: colors.text.secondary }]}>Support</List.Subheader>
          <List.Item
            title="Central de Ajuda"
            description="Perguntas frequentes e artigos de suporte"
            left={(props) => <List.Icon {...props} icon="help-circle" color={colors.feedback.info} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('HelpCenter' as never)}
            accessibilityLabel="Central de Ajuda"
            accessibilityHint="Perguntas frequentes e artigos de suporte"
          />
          <Divider />
          <List.Item
            title="Fale Conosco"
            description="Entre em contato com nossa equipe"
            left={(props) => <List.Icon {...props} icon="email" color={colors.feedback.info} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Contact' as never)}
            accessibilityLabel="Fale Conosco"
            accessibilityHint="Permite entrar em contato com nossa equipe"
          />
          <Divider />
          <List.Item
            title="Termos e Condições"
            description="Leia nossos termos de serviço"
            left={(props) => <List.Icon {...props} icon="file-document-outline" color={colors.feedback.info} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Terms' as never)}
            accessibilityLabel="Termos e Condições"
            accessibilityHint="Permite ler os termos de serviço"
          />
          <Divider />
          <List.Item
            title="Política de Privacidade"
            description="Saiba como protegemos seus dados"
            left={(props) => <List.Icon {...props} icon="shield-lock" color={colors.feedback.info} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Privacy' as never)}
            accessibilityLabel="Política de Privacidade"
            accessibilityHint="Explica como protegemos seus dados pessoais"
          />
        </List.Section>
      </View>

      {/* App Section */}
      <View style={[styles.section, { backgroundColor: colors.surface.card }]}>
        <List.Section>
          <List.Subheader style={[styles.subheader, { color: colors.text.secondary }]}>App</List.Subheader>
          <List.Item
            title="Notificações"
            description="Ver suas notificações"
            left={(props) => <List.Icon {...props} icon="bell" color={colors.text.secondary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Notifications' as never)}
            accessibilityLabel="Notificações"
            accessibilityHint="Permite visualizar suas notificações"
          />
          <Divider />
          <List.Item
            title="Demonstrativo IR"
            description="Informes de rendimentos para IR"
            left={(props) => <List.Icon {...props} icon="file-chart" color={colors.text.secondary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('TaxStatements' as never)}
            accessibilityLabel="Demonstrativo IR"
            accessibilityHint="Permite acessar informes de rendimentos para IR"
          />
          <Divider />
          <List.Item
            title="Idioma"
            description="Português (Brasil)"
            left={(props) => <List.Icon {...props} icon="translate" color={colors.text.secondary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em breve', 'Seleção de idioma estará disponível em breve.')}
            accessibilityLabel="Idioma"
            accessibilityHint="Funcionalidade de seleção de idioma em breve"
          />
          <Divider />
          <List.Item
            title="Sobre"
            description="Versão 1.0.0"
            left={(props) => <List.Icon {...props} icon="information" color={colors.text.secondary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('About' as never)}
            accessibilityLabel="Sobre"
            accessibilityHint="Informações sobre a versão e créditos da aplicação"
          />
        </List.Section>
      </View>

      {/* Sair Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          icon="logout"
          onPress={handleSair}
          style={styles.logoutButton}
          buttonColor={colors.feedback.error}
        >
          Sair
        </Button>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    margin: Spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    // Dynamic color applied via inline styles
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  userInfo: {
    fontSize: Typography.sizes.bodySmall,
    marginBottom: Spacing.xxs,
  },
  editButton: {
    // Dynamic border color applied via inline styles
  },
  section: {
    marginBottom: Spacing.sm,
  },
  subheader: {
    fontSize: Typography.sizes.label,
    fontWeight: Typography.weights.bold,
  },
  logoutContainer: {
    padding: Spacing.md,
  },
  logoutButton: {
    paddingVertical: Spacing.xs,
  },
  bottomSpace: {
    height: Spacing.lg,
  },
});

export default MoreScreen;

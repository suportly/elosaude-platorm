import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Divider, Card, Title, Paragraph, Avatar, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const MoreScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
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
    <ScrollView style={styles.container}>
      {/* User Profile Card */}
      <Card style={styles.profileCard} elevation={3}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={64}
              label={user?.first_name?.charAt(0) || 'U'}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Title>
              <Paragraph style={styles.userInfo}>
                {beneficiary?.registration_number || 'N/A'}
              </Paragraph>
              <Paragraph style={styles.userInfo}>{user?.email || 'N/A'}</Paragraph>
            </View>
          </View>
          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => navigation.navigate('Profile' as never)}
            style={styles.editButton}
          >
            Editar Perfil
          </Button>
        </Card.Content>
      </Card>

      {/* Account Section */}
      <View style={styles.section}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Account</List.Subheader>
          <List.Item
            title="Meu Perfil"
            description="Visualizar e editar suas informações pessoais"
            left={(props) => <List.Icon {...props} icon="account" color="#1976D2" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Profile' as never)}
          />
          <Divider />
          <List.Item
            title="Dependentes"
            description="Gerenciar seus dependentes"
            left={(props) => <List.Icon {...props} icon="account-multiple" color="#1976D2" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Dependents' as never)}
          />
          <Divider />
          <List.Item
            title="Alterar Senha"
            description="Atualizar sua senha"
            left={(props) => <List.Icon {...props} icon="lock-reset" color="#1976D2" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePassword' as never)}
          />
        </List.Section>
      </View>

      {/* Health Section */}
      <View style={styles.section}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Health</List.Subheader>
          <List.Item
            title="Meus Registros de Saúde"
            description="Ver seu histórico médico"
            left={(props) => <List.Icon {...props} icon="file-document-multiple" color="#4CAF50" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('HealthRecords' as never)}
          />
          <Divider />
          <List.Item
            title="Cartão de Vacinação"
            description="Ver seu histórico de vacinações"
            left={(props) => <List.Icon {...props} icon="needle" color="#4CAF50" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('VaccinationCard' as never)}
          />
        </List.Section>
      </View>

      {/* Plan Section */}
      <View style={styles.section}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Plan</List.Subheader>
          <List.Item
            title="Detalhes do Plano"
            description="Ver cobertura e benefícios do seu plano"
            left={(props) => <List.Icon {...props} icon="shield-check" color="#FF9800" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('PlanDetails' as never)}
          />
          <Divider />
          <List.Item
            title="Faturas"
            description="Ver e baixar faturas"
            left={(props) => <List.Icon {...props} icon="file-document" color="#FF9800" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Invoices' as never)}
          />
          <Divider />
          <List.Item
            title="Formas de Pagamento"
            description="Gerenciar opções de pagamento"
            left={(props) => <List.Icon {...props} icon="credit-card" color="#FF9800" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.')}
          />
        </List.Section>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Support</List.Subheader>
          <List.Item
            title="Central de Ajuda"
            description="Perguntas frequentes e artigos de suporte"
            left={(props) => <List.Icon {...props} icon="help-circle" color="#9C27B0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('HelpCenter' as never)}
          />
          <Divider />
          <List.Item
            title="Fale Conosco"
            description="Entre em contato com nossa equipe"
            left={(props) => <List.Icon {...props} icon="email" color="#9C27B0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Contact' as never)}
          />
          <Divider />
          <List.Item
            title="Termos e Condições"
            description="Leia nossos termos de serviço"
            left={(props) => <List.Icon {...props} icon="file-document-outline" color="#9C27B0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Terms' as never)}
          />
          <Divider />
          <List.Item
            title="Política de Privacidade"
            description="Saiba como protegemos seus dados"
            left={(props) => <List.Icon {...props} icon="shield-lock" color="#9C27B0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Privacy' as never)}
          />
        </List.Section>
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <List.Section>
          <List.Subheader style={styles.subheader}>App</List.Subheader>
          <List.Item
            title="Notificações"
            description="Ver suas notificações"
            left={(props) => <List.Icon {...props} icon="bell" color="#666" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Notifications' as never)}
          />
          <Divider />
          <List.Item
            title="Demonstrativo IR"
            description="Informes de rendimentos para IR"
            left={(props) => <List.Icon {...props} icon="file-chart" color="#666" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('TaxStatements' as never)}
          />
          <Divider />
          <List.Item
            title="Idioma"
            description="Português (Brasil)"
            left={(props) => <List.Icon {...props} icon="translate" color="#666" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Em breve', 'Seleção de idioma estará disponível em breve.')}
          />
          <Divider />
          <List.Item
            title="Sobre"
            description="Versão 1.0.0"
            left={(props) => <List.Icon {...props} icon="information" color="#666" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('About' as never)}
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
          buttonColor="#F44336"
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
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#1976D2',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  editButton: {
    borderColor: '#1976D2',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  logoutContainer: {
    padding: 16,
  },
  logoutButton: {
    paddingVertical: 6,
  },
  bottomSpace: {
    height: 20,
  },
});

export default MoreScreen;

# Quickstart: Email Token & Onboarding

**Feature**: 013-email-token-onboarding
**Date**: 2026-01-07

## Implementation Overview

This feature requires changes to both backend (Django) and mobile (React Native) codebases.

---

## Phase 1: Backend Changes

### 1.1 Environment Configuration

Update `.env` on server:

```bash
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=naoresponda@elosaude.com.br
EMAIL_HOST_PASSWORD=mcls eaui jbgo iqum
DEFAULT_FROM_EMAIL=naoresponda@elosaude.com.br
```

### 1.2 Beneficiary Model Update

**File**: `backend/apps/beneficiaries/models.py`

```python
# Add to Beneficiary model
onboarding_completed = models.BooleanField(default=False)
onboarding_completed_at = models.DateTimeField(null=True, blank=True)

def complete_onboarding(self):
    """Mark onboarding as completed"""
    self.onboarding_completed = True
    self.onboarding_completed_at = timezone.now()
    self.save(update_fields=['onboarding_completed', 'onboarding_completed_at'])
```

### 1.3 VerificationToken Model

**File**: `backend/apps/accounts/models.py`

```python
import random
from django.utils import timezone
from datetime import timedelta

class VerificationToken(models.Model):
    """6-digit verification token for first access"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    last_resent_at = models.DateTimeField(null=True, blank=True)
    resend_count = models.IntegerField(default=0)

    TOKEN_EXPIRY_MINUTES = 10
    RESEND_COOLDOWN_SECONDS = 60
    MAX_RESENDS = 5

    @classmethod
    def generate_token(cls):
        """Generate random 6-digit numeric token"""
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])

    @classmethod
    def create_for_user(cls, user):
        """Create new token, invalidating previous ones"""
        # Invalidate existing tokens
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        token = cls(
            user=user,
            token=cls.generate_token(),
            expires_at=timezone.now() + timedelta(minutes=cls.TOKEN_EXPIRY_MINUTES)
        )
        token.save()
        return token

    def is_valid(self):
        """Check if token is valid (not expired, not used)"""
        return not self.is_used and timezone.now() < self.expires_at

    def is_resend_allowed(self):
        """Check if resend is allowed (cooldown and max limit)"""
        if self.resend_count >= self.MAX_RESENDS:
            return False, "Limite de reenvios atingido. Aguarde 30 minutos."

        if self.last_resent_at:
            cooldown_end = self.last_resent_at + timedelta(seconds=self.RESEND_COOLDOWN_SECONDS)
            if timezone.now() < cooldown_end:
                wait_seconds = int((cooldown_end - timezone.now()).total_seconds())
                return False, f"Aguarde {wait_seconds} segundos para reenviar."

        return True, None

    def mark_as_used(self):
        """Mark token as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])

    def increment_resend(self):
        """Increment resend counter"""
        self.resend_count += 1
        self.last_resent_at = timezone.now()
        self.save(update_fields=['resend_count', 'last_resent_at'])
```

### 1.4 Email Template

**File**: `backend/apps/accounts/templates/accounts/email/verification_email.html`

```html
{% extends "accounts/email/base_email.html" %}

{% block content %}
<div style="padding: 30px 20px; text-align: center;">
    <h2 style="color: #333; margin-bottom: 20px;">
        Olá, {{ beneficiary_name }}!
    </h2>

    <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
        Seu código de verificação para acessar o app Elosaúde é:
    </p>

    <div style="background: linear-gradient(135deg, #20a490 0%, #1a8a7a 100%);
                padding: 20px 40px;
                border-radius: 10px;
                display: inline-block;
                margin-bottom: 30px;">
        <span style="color: white;
                     font-size: 36px;
                     font-weight: bold;
                     letter-spacing: 8px;
                     font-family: monospace;">
            {{ token }}
        </span>
    </div>

    <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
        Este código expira em <strong>10 minutos</strong>.
    </p>

    <p style="color: #999; font-size: 14px;">
        Se você não solicitou este código, ignore este email.
    </p>
</div>

<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px;">
    <p style="color: #856404; font-size: 13px; margin: 0;">
        ⚠️ <strong>Atenção:</strong> Nunca compartilhe este código com ninguém.
        A Elosaúde nunca solicita códigos por telefone ou WhatsApp.
    </p>
</div>
{% endblock %}
```

### 1.5 Login Serializer Update

**File**: `backend/apps/accounts/serializers.py`

```python
# In BeneficiarySerializer or login response serializer
class BeneficiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiary
        fields = [
            'id', 'registration_number', 'cpf', 'full_name',
            'birth_date', 'phone', 'email', 'status',
            'onboarding_completed', 'onboarding_completed_at',  # ADD THESE
            # ... other fields
        ]
```

### 1.6 Onboarding Endpoint

**File**: `backend/apps/beneficiaries/views.py`

```python
from rest_framework.decorators import action
from rest_framework.response import Response

class BeneficiaryViewSet(viewsets.ModelViewSet):
    # ... existing code ...

    @action(detail=False, methods=['post'], url_path='complete-onboarding')
    def complete_onboarding(self, request):
        """Complete or skip onboarding"""
        beneficiary = request.user.beneficiary

        skip = request.data.get('skip', False)

        if not skip:
            # Update profile data
            phone = request.data.get('phone')
            email = request.data.get('email')

            if phone:
                beneficiary.phone = phone
            if email:
                beneficiary.email = email

            beneficiary.save()

        # Mark onboarding as completed
        beneficiary.complete_onboarding()

        return Response({
            'message': 'Dados atualizados com sucesso' if not skip else 'Onboarding concluído',
            'beneficiary': BeneficiarySerializer(beneficiary).data
        })
```

---

## Phase 2: Mobile Changes

### 2.1 Auth State Update

**File**: `mobile/src/store/slices/authSlice.ts`

```typescript
// Update Beneficiary interface
interface Beneficiary {
  id: number;
  registration_number: string;
  cpf: string;
  full_name: string;
  // ... existing fields
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
}

// Add action to update onboarding status
setOnboardingCompleted: (state) => {
  if (state.beneficiary) {
    state.beneficiary.onboarding_completed = true;
    state.beneficiary.onboarding_completed_at = new Date().toISOString();
  }
},
```

### 2.2 OnboardingScreen

**File**: `mobile/src/screens/Onboarding/OnboardingScreen.tsx`

```tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { setOnboardingCompleted } from '../../store/slices/authSlice';
import { useColors } from '../../config/ThemeContext';
import { Spacing, Typography } from '../../config/theme';
import axios from 'axios';
import { API_URL } from '../../config/api';

const OnboardingScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const colors = useColors();
  const { beneficiary, accessToken } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState(beneficiary?.phone || '');
  const [email, setEmail] = useState(beneficiary?.email || '');
  const [loading, setLoading] = useState(false);

  const handleComplete = async (skip = false) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/beneficiaries/beneficiaries/complete-onboarding/`,
        { phone, email, skip },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      dispatch(setOnboardingCompleted());
      navigation.replace('Main');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Bem-vindo, {beneficiary?.full_name?.split(' ')[0]}!
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Seus dados básicos já estão cadastrados. Atualize suas informações de contato.
        </Text>
      </View>

      <Card style={[styles.card, { backgroundColor: colors.surface.card }]}>
        <Card.Content>
          <Text style={styles.label}>Nome Completo</Text>
          <Text style={styles.readOnlyValue}>{beneficiary?.full_name}</Text>

          <Text style={styles.label}>CPF</Text>
          <Text style={styles.readOnlyValue}>
            {beneficiary?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
          </Text>

          <Text style={styles.label}>Data de Nascimento</Text>
          <Text style={styles.readOnlyValue}>{beneficiary?.birth_date}</Text>

          <View style={styles.divider} />

          <TextInput
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => handleComplete(false)}
          loading={loading}
          style={styles.primaryButton}
        >
          Salvar e Continuar
        </Button>

        <Button
          mode="text"
          onPress={() => handleComplete(true)}
          disabled={loading}
        >
          Fazer depois
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.screenPadding },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: Typography.sizes.h2, fontWeight: 'bold', marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sizes.body },
  card: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.sizes.caption, color: '#666', marginTop: Spacing.md },
  readOnlyValue: { fontSize: Typography.sizes.body, fontWeight: '500', marginBottom: Spacing.sm },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: Spacing.lg },
  input: { marginBottom: Spacing.md },
  buttons: { marginTop: Spacing.lg },
  primaryButton: { marginBottom: Spacing.md },
});

export default OnboardingScreen;
```

### 2.3 Navigation Update

**File**: `mobile/src/navigation/AppNavigator.tsx`

```tsx
// After successful login check, add onboarding check:
const AppNavigator = () => {
  const { isAuthenticated, beneficiary } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  // ... existing AsyncStorage restore logic ...

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Check if onboarding is needed
  if (!beneficiary?.onboarding_completed) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  return <MainNavigator />;
};
```

### 2.4 FirstAccessScreen Token Update

**File**: `mobile/src/screens/Auth/FirstAccessScreen.tsx`

Update token input to accept 6 digits:

```tsx
// Change token validation
const isValidToken = token.length === 6 && /^\d{6}$/.test(token);

// Update input
<TextInput
  label="Código de Verificação"
  value={token}
  onChangeText={(text) => setToken(text.replace(/\D/g, '').slice(0, 6))}
  keyboardType="number-pad"
  maxLength={6}
  mode="outlined"
/>
```

---

## Testing Checklist

- [ ] Configure Gmail SMTP environment variables on server
- [ ] Run migrations for Beneficiary model changes
- [ ] Test email sending with real Gmail account
- [ ] Verify 6-digit token generation and validation
- [ ] Test token expiration (10 minutes)
- [ ] Test resend rate limiting (60s cooldown, max 5)
- [ ] Test onboarding screen appears only on first login
- [ ] Test onboarding skip functionality
- [ ] Test profile update during onboarding
- [ ] Verify onboarding doesn't appear on subsequent logins

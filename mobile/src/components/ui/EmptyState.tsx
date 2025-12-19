/**
 * EmptyState Component
 *
 * Componente para estados vazios de listas e telas
 * - Ilustração/ícone amigável
 * - Título explicativo
 * - Descrição breve do que fazer
 * - CTA claro para próxima ação
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../config/theme';
import { Button } from './Button';

// =============================================================================
// TYPES
// =============================================================================

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  compact = false,
}) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {/* Icon */}
      <View style={[styles.iconContainer, compact && styles.iconContainerCompact]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={compact ? 48 : 72}
          color={Colors.text.tertiary}
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>

      {/* Description */}
      {description && (
        <Text style={[styles.description, compact && styles.descriptionCompact]}>
          {description}
        </Text>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsContainer}>
          {actionLabel && onAction && (
            <Button
              title={actionLabel}
              onPress={onAction}
              variant="primary"
              size={compact ? 'small' : 'medium'}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="text"
              size={compact ? 'small' : 'medium'}
            />
          )}
        </View>
      )}
    </View>
  );
};

// =============================================================================
// PRESET EMPTY STATES
// =============================================================================

// Empty list
export const EmptyList: React.FC<{
  itemName?: string;
  onAdd?: () => void;
  style?: ViewStyle;
}> = ({ itemName = 'itens', onAdd, style }) => (
  <EmptyState
    icon="format-list-bulleted"
    title={`Nenhum ${itemName} encontrado`}
    description={`Não há ${itemName} para exibir no momento.`}
    actionLabel={onAdd ? `Adicionar ${itemName}` : undefined}
    onAction={onAdd}
    style={style}
  />
);

// Empty search results
export const EmptySearch: React.FC<{
  searchTerm?: string;
  onClear?: () => void;
  style?: ViewStyle;
}> = ({ searchTerm, onClear, style }) => (
  <EmptyState
    icon="magnify"
    title="Nenhum resultado encontrado"
    description={
      searchTerm
        ? `Não encontramos resultados para "${searchTerm}". Tente outros termos.`
        : 'Tente ajustar sua busca ou filtros.'
    }
    actionLabel={onClear ? 'Limpar busca' : undefined}
    onAction={onClear}
    style={style}
  />
);

// Error state
export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ message, onRetry, style }) => (
  <EmptyState
    icon="alert-circle-outline"
    title="Algo deu errado"
    description={message || 'Ocorreu um erro ao carregar os dados. Tente novamente.'}
    actionLabel={onRetry ? 'Tentar novamente' : undefined}
    onAction={onRetry}
    style={style}
  />
);

// Offline state
export const OfflineState: React.FC<{
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ onRetry, style }) => (
  <EmptyState
    icon="wifi-off"
    title="Sem conexão"
    description="Verifique sua conexão com a internet e tente novamente."
    actionLabel={onRetry ? 'Tentar novamente' : undefined}
    onAction={onRetry}
    style={style}
  />
);

// No notifications
export const EmptyNotifications: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <EmptyState
    icon="bell-outline"
    title="Nenhuma notificação"
    description="Você está em dia! Novas notificações aparecerão aqui."
    style={style}
  />
);

// No documents
export const EmptyDocuments: React.FC<{
  onAdd?: () => void;
  style?: ViewStyle;
}> = ({ onAdd, style }) => (
  <EmptyState
    icon="file-document-outline"
    title="Nenhum documento"
    description="Seus documentos aparecerão aqui quando disponíveis."
    actionLabel={onAdd ? 'Adicionar documento' : undefined}
    onAction={onAdd}
    style={style}
  />
);

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  containerCompact: {
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  iconContainerCompact: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  titleCompact: {
    fontSize: Typography.sizes.body,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.body * Typography.lineHeight.normal,
    maxWidth: 300,
    marginBottom: Spacing.lg,
  },
  descriptionCompact: {
    fontSize: Typography.sizes.bodySmall,
    marginBottom: Spacing.md,
  },
  actionsContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
});

export default EmptyState;

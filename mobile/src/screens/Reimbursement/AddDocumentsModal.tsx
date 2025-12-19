import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform, Vibration } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  ProgressBar,
  IconButton,
  Surface,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentUploader, { UploadedDocument } from '../../components/DocumentUploader';
import { uploadFiles } from '../../utils/fileUploader';
import { useAddReimbursementDocumentsMutation } from '../../store/services/api';
import { Colors } from '../../config/theme';

interface AddDocumentsModalProps {
  visible: boolean;
  onDismiss: () => void;
  reimbursementId: number;
  protocolNumber: string;
}

export default function AddDocumentsModal({
  visible,
  onDismiss,
  reimbursementId,
  protocolNumber,
}: AddDocumentsModalProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [addDocuments] = useAddReimbursementDocumentsMutation();

  const triggerHapticFeedback = (type: 'success' | 'error' | 'warning') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        // Use Vibration API as fallback for haptic feedback
        switch (type) {
          case 'success':
            Vibration.vibrate(50);
            break;
          case 'error':
            Vibration.vibrate([0, 100, 50, 100]);
            break;
          case 'warning':
            Vibration.vibrate(100);
            break;
        }
      } catch (error) {
        // Vibration not available, ignore
      }
    }
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um documento para enviar.');
      return;
    }

    try {
      setUploading(true);
      setUploadStatus('uploading');
      setUploadProgress(0);
      setErrorMessage('');

      // Get access token
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      // Upload files to server
      setUploadProgress(0.3);
      const uploadedFiles = await uploadFiles(
        {
          documents,
          uploadType: 'REIMBURSEMENT',
          onProgress: (progress) => {
            setUploadProgress(0.3 + progress * 0.4); // 30% to 70%
          },
        },
        accessToken
      );

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('Falha ao fazer upload dos documentos');
      }

      // Associate documents with reimbursement
      setUploadProgress(0.8);
      const documentIds = uploadedFiles.map((file) => file.id);

      await addDocuments({
        reimbursementId,
        documents: documentIds,
      }).unwrap();

      setUploadProgress(1);
      setUploadStatus('success');
      triggerHapticFeedback('success');

      // Show success message and close after delay
      setTimeout(() => {
        handleClose();
        Alert.alert(
          'Sucesso!',
          `${documents.length} documento(s) enviado(s) com sucesso para o protocolo ${protocolNumber}.`
        );
      }, 1500);

    } catch (error) {
      console.error('Error adding documents:', error);
      setUploadStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao enviar documentos. Tente novamente.'
      );
      triggerHapticFeedback('error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setDocuments([]);
    setUploading(false);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    onDismiss();
  };

  const handleRetry = () => {
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);
  };

  const renderContent = () => {
    if (uploadStatus === 'success') {
      return (
        <View style={styles.statusContainer}>
          <Icon name="check-circle" size={64} color={Colors.feedback.success} />
          <Text variant="titleMedium" style={styles.statusTitle}>
            Documentos Enviados!
          </Text>
          <Text variant="bodyMedium" style={styles.statusMessage}>
            Seus documentos foram adicionados ao reembolso com sucesso.
          </Text>
        </View>
      );
    }

    if (uploadStatus === 'error') {
      return (
        <View style={styles.statusContainer}>
          <Icon name="alert-circle" size={64} color={Colors.feedback.error} />
          <Text variant="titleMedium" style={styles.statusTitle}>
            Erro no Envio
          </Text>
          <Text variant="bodyMedium" style={styles.statusMessage}>
            {errorMessage}
          </Text>
          <Button mode="contained" onPress={handleRetry} style={styles.retryButton}>
            Tentar Novamente
          </Button>
        </View>
      );
    }

    return (
      <>
        <Text variant="bodyMedium" style={styles.description}>
          Adicione documentos comprobatórios para o reembolso {protocolNumber}.
        </Text>

        <DocumentUploader
          documents={documents}
          onDocumentsChange={setDocuments}
          maxFiles={5}
          label="Documentos Adicionais"
        />

        {uploading && (
          <View style={styles.progressContainer}>
            <Text variant="bodySmall" style={styles.progressText}>
              Enviando documentos... {Math.round(uploadProgress * 100)}%
            </Text>
            <ProgressBar
              progress={uploadProgress}
              color={Colors.primary.main}
              style={styles.progressBar}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={uploading ? undefined : handleClose}
        contentContainerStyle={styles.modalContainer}
        dismissable={!uploading}
      >
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              Enviar Documentos
            </Text>
            {!uploading && uploadStatus !== 'success' && (
              <IconButton
                icon="close"
                size={24}
                onPress={handleClose}
                style={styles.closeButton}
              />
            )}
          </View>

          <View style={styles.content}>{renderContent()}</View>

          {uploadStatus === 'idle' && (
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleClose}
                disabled={uploading}
                style={styles.actionButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={uploading}
                disabled={uploading || documents.length === 0}
                style={styles.actionButton}
                icon="upload"
              >
                Enviar
              </Button>
            </View>
          )}
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
  },
  surface: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    margin: 0,
  },
  content: {
    padding: 20,
  },
  description: {
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressText: {
    color: Colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    minWidth: 100,
  },
  statusContainer: {
    alignItems: 'center',
    padding: 20,
  },
  statusTitle: {
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusMessage: {
    marginTop: 8,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
  retryButton: {
    marginTop: 20,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Card, Text, IconButton, Chip } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../config/theme';

export interface UploadedDocument {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface DocumentUploaderProps {
  documents: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  label?: string;
}

export default function DocumentUploader({
  documents,
  onDocumentsChange,
  maxFiles = 5,
  allowedTypes = ['image/*', 'application/pdf'],
  label = 'Documentos',
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de permissão para acessar sua galeria de fotos.'
        );
        return false;
      }
    }
    return true;
  };

  const pickDocument = async () => {
    try {
      if (documents.length >= maxFiles) {
        Alert.alert('Limite Atingido', `Você pode enviar no máximo ${maxFiles} arquivos.`);
        return;
      }

      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newDoc: UploadedDocument = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        };
        onDocumentsChange([...documents, newDoc]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Erro', 'Falha ao selecionar documento');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      if (documents.length >= maxFiles) {
        Alert.alert('Limite Atingido', `Você pode enviar no máximo ${maxFiles} arquivos.`);
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'image.jpg';
        const newDoc: UploadedDocument = {
          uri: asset.uri,
          name: fileName,
          type: 'image/jpeg',
          size: asset.fileSize,
        };
        onDocumentsChange([...documents, newDoc]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      if (documents.length >= maxFiles) {
        Alert.alert('Limite Atingido', `Você pode enviar no máximo ${maxFiles} arquivos.`);
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de permissão para acessar sua câmera.'
        );
        return;
      }

      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `photo_${Date.now()}.jpg`;
        const newDoc: UploadedDocument = {
          uri: asset.uri,
          name: fileName,
          type: 'image/jpeg',
          size: asset.fileSize,
        };
        onDocumentsChange([...documents, newDoc]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Falha ao tirar foto');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocs);
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Adicionar Documento',
      'Escolha uma opção',
      [
        {
          text: 'Tirar Foto',
          onPress: takePhoto,
        },
        {
          text: 'Galeria de Fotos',
          onPress: pickImage,
        },
        {
          text: 'Escolher Arquivo',
          onPress: pickDocument,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return 'file-image';
    if (type === 'application/pdf') return 'file-pdf-box';
    return 'file-document';
  };

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={styles.label}>
        {label}
      </Text>

      {documents.length > 0 && (
        <View style={styles.documentsList}>
          {documents.map((doc, index) => (
            <Card key={index} style={styles.documentCard}>
              <Card.Content style={styles.documentContent}>
                <Icon name={getFileIcon(doc.type)} size={32} color={Colors.primary} />
                <View style={styles.documentInfo}>
                  <Text variant="bodyMedium" numberOfLines={1} style={styles.documentName}>
                    {doc.name}
                  </Text>
                  {doc.size && (
                    <Text variant="bodySmall" style={styles.documentSize}>
                      {formatFileSize(doc.size)}
                    </Text>
                  )}
                </View>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => removeDocument(index)}
                  iconColor={Colors.error}
                />
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {documents.length < maxFiles && (
        <Button
          mode="outlined"
          icon="plus"
          onPress={showUploadOptions}
          style={styles.addButton}
          loading={uploading}
          disabled={uploading}
        >
          Adicionar Documento
        </Button>
      )}

      <View style={styles.infoContainer}>
        <Icon name="information-outline" size={16} color={Colors.textSecondary} />
        <Text variant="bodySmall" style={styles.infoText}>
          Formatos aceitos: Imagens (JPG, PNG) e PDF. Máximo {maxFiles} arquivos.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  documentsList: {
    gap: 8,
    marginBottom: 12,
  },
  documentCard: {
    elevation: 1,
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontWeight: '500',
  },
  documentSize: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  infoText: {
    color: Colors.textSecondary,
    flex: 1,
  },
});

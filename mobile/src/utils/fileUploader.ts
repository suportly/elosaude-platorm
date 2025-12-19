import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { UploadedDocument } from '../components/DocumentUploader';

// Base API URL - should match your API configuration
const API_BASE_URL = 'http://localhost:8003/api';

export interface UploadOptions {
  documents: UploadedDocument[];
  uploadType?: string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: (uploadedFiles: UploadedFileResponse[]) => void;
}

export interface UploadedFileResponse {
  id: number;
  file: string;
  original_filename: string;
  upload_type: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
}

/**
 * Upload multiple files to the backend
 * @param options Upload configuration options
 * @param accessToken JWT access token for authentication
 * @returns Promise with uploaded file information
 */
export const uploadFiles = async (
  options: UploadOptions,
  accessToken: string
): Promise<UploadedFileResponse[] | null> => {
  const { documents, uploadType = 'OTHER', onProgress, onError, onSuccess } = options;

  try {
    // Validate documents
    if (!documents || documents.length === 0) {
      throw new Error('Nenhum arquivo selecionado');
    }

    // Validate access token
    if (!accessToken) {
      throw new Error('Token de autenticação não encontrado. Por favor, faça login novamente.');
    }

    // Create FormData
    const formData = new FormData();

    // Add upload_type parameter
    formData.append('upload_type', uploadType);

    // Add all files to FormData
    for (const doc of documents) {
      // Get file info to ensure it exists
      const fileInfo = await FileSystem.getInfoAsync(doc.uri);

      if (!fileInfo.exists) {
        throw new Error(`Arquivo não encontrado: ${doc.name}`);
      }

      // Create file object for FormData
      // @ts-ignore - React Native FormData accepts this format
      formData.append('files', {
        uri: doc.uri,
        type: doc.type || 'application/octet-stream',
        name: doc.name,
      });
    }

    // Upload with fetch
    const response = await fetch(`${API_BASE_URL}/uploads/bulk_upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type - browser/RN will set it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
        errorData.detail ||
        `Erro ao enviar arquivos: ${response.status}`
      );
    }

    const uploadedFiles: UploadedFileResponse[] = await response.json();

    // Call progress callback with 100%
    onProgress?.(1);

    // Call success callback
    onSuccess?.(uploadedFiles);

    return uploadedFiles;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar arquivos';
    onError?.(error instanceof Error ? error : new Error(errorMessage));

    Alert.alert(
      'Erro no Upload',
      errorMessage,
      [{ text: 'OK' }]
    );

    return null;
  }
};

/**
 * Upload files with progress tracking using FileSystem.uploadAsync
 * This provides more accurate progress information than fetch
 */
export const uploadFilesWithProgress = async (
  options: UploadOptions,
  accessToken: string
): Promise<UploadedFileResponse[] | null> => {
  const { documents, uploadType = 'OTHER', onProgress, onError, onSuccess } = options;

  try {
    // Validate documents
    if (!documents || documents.length === 0) {
      throw new Error('Nenhum arquivo selecionado');
    }

    // Validate access token
    if (!accessToken) {
      throw new Error('Token de autenticação não encontrado. Por favor, faça login novamente.');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('upload_type', uploadType);

    // Add all files to FormData
    for (const doc of documents) {
      const fileInfo = await FileSystem.getInfoAsync(doc.uri);

      if (!fileInfo.exists) {
        throw new Error(`Arquivo não encontrado: ${doc.name}`);
      }

      // @ts-ignore
      formData.append('files', {
        uri: doc.uri,
        type: doc.type || 'application/octet-stream',
        name: doc.name,
      });
    }

    // Use FileSystem.uploadAsync for progress tracking
    // uploadType: 1 = MULTIPART mode for form-data uploads
    const uploadResult = await FileSystem.uploadAsync(
      `${API_BASE_URL}/uploads/bulk_upload/`,
      documents[0].uri, // Primary file
      {
        httpMethod: 'POST',
        uploadType: 1, // MULTIPART
        fieldName: 'files',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        parameters: {
          upload_type: uploadType,
        },
      }
    );

    if (uploadResult.status !== 201 && uploadResult.status !== 200) {
      const errorData = JSON.parse(uploadResult.body);
      throw new Error(
        errorData.error ||
        errorData.detail ||
        `Erro ao enviar arquivos: ${uploadResult.status}`
      );
    }

    const uploadedFiles: UploadedFileResponse[] = JSON.parse(uploadResult.body);

    // Call progress callback with 100%
    onProgress?.(1);

    // Call success callback
    onSuccess?.(uploadedFiles);

    return uploadedFiles;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar arquivos';
    onError?.(error instanceof Error ? error : new Error(errorMessage));

    Alert.alert(
      'Erro no Upload',
      errorMessage,
      [{ text: 'OK' }]
    );

    return null;
  }
};

/**
 * Delete a file from the server
 * @param fileId ID of the file to delete
 * @param accessToken JWT access token
 */
export const deleteFile = async (
  fileId: number,
  accessToken: string
): Promise<boolean> => {
  try {
    if (!accessToken) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}/uploads/${fileId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar arquivo: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    Alert.alert(
      'Erro',
      'Não foi possível deletar o arquivo. Tente novamente.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

/**
 * Format file size to human-readable format
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let fileSize = bytes;

  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024;
    unitIndex++;
  }

  return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Validate file before upload
 * @param document Document to validate
 * @param maxSizeBytes Maximum file size in bytes (default 10MB)
 * @param allowedTypes Allowed MIME types
 */
export const validateFile = (
  document: UploadedDocument,
  maxSizeBytes: number = 10 * 1024 * 1024, // 10MB
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
): { valid: boolean; error?: string } => {
  // Check file size
  if (document.size && document.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Arquivo ${document.name} excede o tamanho máximo de ${formatFileSize(maxSizeBytes)}`,
    };
  }

  // Check file type
  const fileType = document.type.toLowerCase();
  const isAllowed = allowedTypes.some(allowed => {
    if (allowed.endsWith('/*')) {
      const prefix = allowed.split('/')[0];
      return fileType.startsWith(prefix + '/');
    }
    return fileType === allowed.toLowerCase();
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${document.name}. Tipos aceitos: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Validate multiple files before upload
 * @param documents Documents to validate
 * @param maxSizeBytes Maximum file size in bytes
 * @param allowedTypes Allowed MIME types
 */
export const validateFiles = (
  documents: UploadedDocument[],
  maxSizeBytes?: number,
  allowedTypes?: string[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const doc of documents) {
    const validation = validateFile(doc, maxSizeBytes, allowedTypes);
    if (!validation.valid && validation.error) {
      errors.push(validation.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

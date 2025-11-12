import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface DownloadOptions {
  url: string;
  filename: string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: (fileUri: string) => void;
}

/**
 * Download a PDF file and optionally share it
 * @param options Download configuration options
 * @returns Promise with the local file URI
 */
export const downloadPDF = async (options: DownloadOptions): Promise<string | null> => {
  const { url, filename, onProgress, onError, onSuccess } = options;

  try {
    // Validate URL
    if (!url) {
      throw new Error('URL do arquivo não fornecida');
    }

    // Ensure filename has .pdf extension
    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Create file path
    const fileUri = `${FileSystem.documentDirectory}${pdfFilename}`;

    // Download file with progress tracking
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress?.(progress);
      }
    );

    const result = await downloadResumable.downloadAsync();

    if (!result) {
      throw new Error('Falha no download do arquivo');
    }

    onSuccess?.(result.uri);
    return result.uri;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao baixar arquivo';
    onError?.(error instanceof Error ? error : new Error(errorMessage));

    Alert.alert(
      'Erro no Download',
      errorMessage,
      [{ text: 'OK' }]
    );

    return null;
  }
};

/**
 * Share a PDF file using the native share dialog
 * @param fileUri Local file URI to share
 * @param filename Name of the file
 */
export const sharePDF = async (fileUri: string, filename?: string): Promise<void> => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert(
        'Compartilhamento indisponível',
        'Seu dispositivo não suporta compartilhamento de arquivos.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: filename ? `Compartilhar ${filename}` : 'Compartilhar PDF',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao compartilhar arquivo';

    Alert.alert(
      'Erro ao Compartilhar',
      errorMessage,
      [{ text: 'OK' }]
    );
  }
};

/**
 * Download and immediately share a PDF file
 * @param options Download configuration options
 */
export const downloadAndSharePDF = async (options: DownloadOptions): Promise<void> => {
  try {
    const fileUri = await downloadPDF(options);

    if (fileUri) {
      await sharePDF(fileUri, options.filename);
    }
  } catch (error) {
    // Error already handled in downloadPDF
    console.error('Error in downloadAndSharePDF:', error);
  }
};

/**
 * Delete a downloaded PDF file
 * @param fileUri Local file URI to delete
 */
export const deletePDF = async (fileUri: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return false;
  }
};

/**
 * Check if a PDF file already exists locally
 * @param filename Name of the file to check
 * @returns File info if exists, null otherwise
 */
export const checkPDFExists = async (filename: string): Promise<FileSystem.FileInfo | null> => {
  try {
    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${pdfFilename}`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    return fileInfo.exists ? fileInfo : null;
  } catch (error) {
    console.error('Error checking PDF existence:', error);
    return null;
  }
};

/**
 * Get the size of a PDF file in a human-readable format
 * @param fileUri Local file URI
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export const getFileSizeFormatted = (size: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let fileSize = size;

  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024;
    unitIndex++;
  }

  return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Generate a safe filename from a string
 * @param name Original name
 * @returns Safe filename
 */
export const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 200); // Limit filename length
};

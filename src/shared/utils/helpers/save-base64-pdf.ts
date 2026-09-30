import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function getPdfFilename(prefix = 'pensioner-app'): string {
  const now = new Date();

  const date = now.toISOString().replace('T', '-').replace(/:/g, '-').replace(/\..+/, '');

  return `${prefix}-${date}.pdf`;
}

function cleanBase64(base64: string): string {
  return base64.replace(/^data:application\/pdf;base64,/, '');
}

export async function saveBase64Pdf(base64: string, filename = getPdfFilename()): Promise<string> {
  if (!base64) {
    throw new Error('PDF data is empty');
  }

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const file = new File(Paths.cache, safeFilename);

  file.write(cleanBase64(base64), {
    encoding: 'base64',
  });

  return file.uri;
}

export async function sharePdf(fileUri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Pension Statement',
    UTI: 'com.adobe.pdf',
  });
}

export async function saveAndShareBase64Pdf(
  base64: string,
  filename = getPdfFilename()
): Promise<string> {
  const fileUri = await saveBase64Pdf(base64, filename);

  await sharePdf(fileUri);

  return fileUri;
}

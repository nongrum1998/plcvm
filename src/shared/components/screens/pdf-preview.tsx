import { useEffect } from 'react';
import { View } from 'react-native';

import { Button } from '../ui';
import { PreviewPDF } from './preview-pdf';
import { saveAndShareBase64Pdf } from '@utils/helpers/save-base64-pdf';
import { usePdfPreviewStore } from '@stores/pdf-preview';

export function PdfPreview() {
  const isDownloadable = usePdfPreviewStore((s) => s.downloadable);
  const rawUri = usePdfPreviewStore((s) => s.uri);
  const uri = rawUri?.startsWith('data:application/pdf;base64,')
    ? rawUri
    : `data:application/pdf;base64,${rawUri}`;

  const clearPdf = usePdfPreviewStore((s) => s.clearPdf);

  useEffect(() => {
    return clearPdf;
  }, [clearPdf]);

  return (
    <>
      <View className="flex-1">
        <PreviewPDF base64={uri} />
      </View>

      {isDownloadable && (
        <View className="p-4">
          <Button className="w-full" size="lg" onPress={() => saveAndShareBase64Pdf(uri)}>
            Download
          </Button>
        </View>
      )}
    </>
  );
}

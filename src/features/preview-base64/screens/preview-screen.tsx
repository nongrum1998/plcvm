import { useEffect } from 'react';
import { View } from 'react-native';

import { PreviewPDF } from '../components/preview-pdf';
import { saveAndShareBase64Pdf } from '@utils/helpers/save-base64-pdf';
import { usePdfPreviewStore } from '@stores/pdf-preview';
import { Button } from '@components';

export function PreviewScreen() {
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

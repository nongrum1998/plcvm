import Pdf from 'react-native-pdf';
import { View } from 'react-native';

import { useSafeNavigation } from '@hooks';
import { logger } from '@utils';
import { EmptyScreen } from './empty-screen';

type PreviewPDFProps = {
  base64: string;
};

export function PreviewPDF({ base64: rawUri }: PreviewPDFProps) {
  const uri = rawUri?.startsWith('data:application/pdf;base64,')
    ? rawUri
    : `data:application/pdf;base64,${rawUri}`;

  const { navigate, back } = useSafeNavigation();

  const onPressGoBack = () => {
    const wentBack = back();

    if (!wentBack) {
      navigate('/', 'replace');
    }
  };

  if (!uri) {
    return (
      <EmptyScreen
        title="Invalid PDF"
        message="The provided PDF is invalid."
        refreshLabel="Go back"
        refresh={onPressGoBack}
      />
    );
  }

  return (
    <>
      <View className="flex-1">
        <Pdf
          source={{ uri }}
          trustAllCerts={false}
          enableDoubleTapZoom
          style={{
            height: '100%',
            width: '100%',
            flex: 1,
          }}
          onError={(error) => {
            logger.log('PDF render error:', error);
          }}
        />
      </View>
    </>
  );
}

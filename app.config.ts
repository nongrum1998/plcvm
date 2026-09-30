// `tsx/cjs` registers a CommonJS require hook for TypeScript, which is what
// lets this file import the raw-TypeScript modules under ./expo-config.
// Expo's config loader transpiles only the entry app.config.ts and installs no
// hook of its own, so without this the import below fails to resolve.
// Must stay the FIRST import in the file.
import 'tsx/cjs';
import { createAppConfig } from './expo-config';
import { ExpoConfig } from 'expo/config';

// Expo Project ID
const PROJECT_ID = '966c5b58-3295-42e5-a4df-bfe597541f66';

const BUNDLE_IDENTIFIER = 'com.jyrwajr.plcvm';

const config = createAppConfig({
  appName: 'PLCVM',
  slug: 'plcvm',
  scheme: 'plcvm',
  baseBundleIdentifier: BUNDLE_IDENTIFIER,
  projectId: PROJECT_ID,
  owner: 'pixel-thread',
  icon: './src/shared/assets/images/logo.jpg',
  version: '1.0.0',
  cameraUsageDescription: 'Face Verification usage',
  plugins: [
    'expo-sharing',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
  ],
});

export default config as ExpoConfig;

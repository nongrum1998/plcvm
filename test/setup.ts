import 'react-native-gesture-handler/jestSetup';
import { setUpTests } from 'react-native-reanimated';

// Registers Gesture Handler's Jest mocks so components relying on
// gesture-handler can mount under Jest without a native runtime.
// (Loaded via `setupFilesAfterEnv` in jest.config.js.)

// Initializes Reanimated's Jest test environment so animations run
// synchronously and deterministically (defaults to 60 fps).
setUpTests();

/**
 * Native modules have no implementation under Jest: they call into the
 * TurboModule/NativeModules registry, which only exists in a real app runtime.
 * Every module mocked below throws "the native module is not available" on
 * import otherwise.
 *
 * These stubs are inert on purpose. Unit tests assert on the component tree
 * and the calls it makes, not on the pixels a native view would draw. A suite
 * that needs real behaviour from one of these should assert on the JS wrapper
 * in isolation and mock the module locally.
 *
 * When adding a shared component that imports a new native module, mock it
 * here — otherwise every suite whose import graph reaches that component
 * through the `@components` barrel fails at import time, before a single
 * assertion runs.
 */

// ── expo-application ────────────────────────────────────────────
// Mirrors the members the codebase consumes: the version/name/id constants and
// the id-lookup helpers used by `use-dlc-submit`.
jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
  applicationName: 'PLCVM',
  applicationId: 'com.jyrwajr.plcvm',
  getAndroidId: jest.fn(() => ''),
  getIosIdForVendorAsync: jest.fn(async () => null),
  getInstallationTimeAsync: jest.fn(async () => new Date(0)),
}));

// ── expo-device ─────────────────────────────────────────────────
// Mirrors the members the codebase consumes (see
// `src/shared/utils/helpers/device/is-real-device.ts`).
jest.mock('expo-device', () => ({
  isDevice: true,
  isEmulator: false,
}));

// ── expo-router ─────────────────────────────────────────────────
// Loading the real router pulls in `expo-asset`, `expo-constants` and
// `expo-modules-core`'s native view-manager adapter (its iOS toolbar calls
// `requireNativeViewManager` at module scope), none of which resolve under
// Jest. Replaced wholesale rather than mocked native-module by native-module.
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  navigate: jest.fn(),
  setParams: jest.fn(),
  dismissAll: jest.fn(),
  dismissTo: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  useRootNavigationState: () => ({ key: 'root', index: 0, routes: [] }),
  useNavigationState: () => ({ index: 0, routes: [] }),
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
  Drawer: 'Drawer',
  Redirect: 'Redirect',
}));

// ── expo-screen-capture ─────────────────────────────────────────
// `usePreventScreenCapture` is mounted app-wide; the native call is a no-op here.
jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(async () => {}),
  allowScreenCaptureAsync: jest.fn(async () => {}),
}));

// ── react-native-pdf ───────────────────────────────────────────
// A native view. Its JS wrapper reaches `react-native-blob-util`, which throws
// on import, so mocking the wrapper keeps the blob util out of the graph.
jest.mock('react-native-pdf', () => 'Pdf');

// ── react-native-vision-camera ─────────────────────────────────// Native camera. Only referenced for its `Camera` component and device
// descriptors in the face-capture flow.
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: jest.fn(() => null),
  useCameraPermissionStatus: jest.fn(() => 'granted'),
  useFrameProcessor: jest.fn(),
  runAtTargetFps: jest.fn(),
  Facing: { back: 'back', front: 'front' },
}));

jest.mock('react-native-vision-camera-face-detector', () => ({
  FaceDetector: 'FaceDetector',
  useFaceDetector: jest.fn(() => ({ isActive: false })),
}));

// ── expo-sharing / expo-file-system ────────────────────────────
// Reached through `utils/helpers/save-base64-pdf`, which the PDF flow uses to
// write and share a document. Both register native modules on import.
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-file-system', () => {
  class File {
    create() {}
    write() {}
    delete() {}
    uri = '';
  }
  class Directory {
    create() {}
    delete() {}
    uri = '';
  }
  return {
    File,
    Directory,
    Paths: { document: 'file:///document/', cache: 'file:///cache/' },
  };
});

// ── expo-updates ────────────────────────────────────────────────
// Used by `stores/update.store` to poll for, fetch and load OTA updates.
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(async () => ({ isNew: false })),
  reloadAsync: jest.fn(async () => {}),
  channel: 'development',
  runtimeVersion: '1.0.0',
  isEnabled: false,
}));

// ── expo-location ──────────────────────────────────────────────
// Permission + foreground-position lookups behind `useCurrentLocation`.
jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  Accuracy: { Balanced: 3, High: 4, Highest: 5, Low: 2 },
  requestForegroundPermissionsAsync: jest.fn(async () => 'granted'),
  getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 0, longitude: 0, accuracy: 0, altitude: 0, heading: 0, speed: 0 },
    timestamp: 0,
  })),
  watchPositionAsync: jest.fn(() => ({ remove: jest.fn() })),
  hasServicesEnabledAsync: jest.fn(async () => true),
}));

// ── expo-image-manipulator ─────────────────────────────────────
// Face-capture photo downscaling before upload.
jest.mock('expo-image-manipulator', () => {
  const ImageManipulator = {
    manipulateAsync: jest.fn(async (uri: string) => ({
      uri,
      width: 0,
      height: 0,
    })),
  };
  return {
    ImageManipulator,
    SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
    useImageManipulator: () => ({ manipulateAsync: ImageManipulator.manipulateAsync }),
  };
});

// ── expo-crypto ────────────────────────────────────────────────
// Backs the Fernet payload encryption in `lib/encryption`.
jest.mock('expo-crypto', () => ({
  getRandomBytes: (size: number) => new Uint8Array(size).fill(0),
  getRandomBytesAsync: async (size: number) => new Uint8Array(size).fill(0),
  getRandomValues: (array: Uint8Array) => array,
  getRandomValuesAsync: async (array: Uint8Array) => array,
  digestStringAsync: async (_algo: string, data: string) => data,
  digest: async (_algo: string, data: Uint8Array) => data,
}));

// ── expo-splash-screen ─────────────────────────────────────────
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => true),
  setOptions: jest.fn(),
}));

// ── expo-status-bar ────────────────────────────────────────────
jest.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));

// ── expo-linking ───────────────────────────────────────────────
// `openEmailAddress` / `openPhoneNumber` in `utils/helpers/linking`.
jest.mock('expo-linking', () => ({
  openURL: jest.fn(async () => true),
  canOpenURL: jest.fn(async () => true),
  createURL: (path: string) => `plcvm://${path}`,
  parse: (url: string) => ({ hostname: 'plcvm', path: url }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// ── expo-secure-store ──────────────────────────────────────────
// Keychain backing for the persisted stores. Suites that exercise persistence
// override this with an in-memory implementation.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    isAvailableAsync: jest.fn(async () => true),
    getItem: jest.fn((key: string) => store.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItem: jest.fn((key: string) => {
      store.delete(key);
    }),
  };
});

// ── jail-monkey ────────────────────────────────────────────────
// Root/jailbreak gate behind `RootProvider`. Must not weaken production
// behaviour; the Jest stub only avoids a native call.
jest.mock('jail-monkey', () => ({
  __esModule: true,
  default: {
    isJailBroken: () => false,
    isJailBrokenSync: () => false,
    canCheckEnvironment: () => false,
    isRooted: () => false,
    isRootedSync: () => false,
  },
}));

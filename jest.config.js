/**
 * Jest configuration.
 *
 * Lives at the repository root (rather than being shared from a package) so
 * that `rootDir` and every `<rootDir>` placeholder below resolve against the
 * app itself. `preset` and `resolver` are therefore read from this project's
 * own `node_modules`.
 */
module.exports = {
  preset: 'jest-expo',
  watchman: false,
  testMatch: [
    '<rootDir>/src/features/**/test/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/src/shared/**/test/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  resolver: 'react-native-worklets/jest/resolver',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|jail-monkey))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};

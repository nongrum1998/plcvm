// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Re-enable watchman for file crawling/watching.
// Expo SDK 57 forces `resolver.useWatchman` to null (@expo/metro-config
// ExpoMetroConfig.js), which @expo/cli resolves to `false`, falling back to
// Node fs watchers over node_modules. On large pnpm trees this exhausts the
// process file-handle table during HMR and crashes the dev server with
// EMFILE ("too many open files"). Watchman holds those handles in its daemon
// instead. Requires `watchman` on PATH.
config.resolver.useWatchman = true;

module.exports = withNativeWind(config, { input: './src/shared/styles/index.css' });

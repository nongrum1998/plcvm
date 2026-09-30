const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', './http/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);

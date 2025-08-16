// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      '@stylistic': stylistic
    },
    ignores: ['dist/*'],
    rules: {
      "no-console": ['error'],
      '@stylistic/indent': ['error'],
      '@stylistic/jsx-indent-props': ['error'],
    }
  },
]);

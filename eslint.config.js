// https://docs.expo.dev/guides/using-eslint/
const stylistic = require('@stylistic/eslint-plugin');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
    expoConfig,
    {
        plugins: {
            '@stylistic': stylistic
        },
        ignores: ['dist/*'],
        rules: {
            '@stylistic/eol-last': ['error', 'always'],
            'curly': ['error', 'all'],
            "no-console": ['error'],
            '@stylistic/indent': ['error'],
            '@stylistic/jsx-indent-props': ['error'],
            'no-restricted-imports': ['error', {
                paths: [
                    {name: 'expo-document-picker', message: 'Use @/platform/jsonFiles instead.'},
                    {name: 'expo-file-system', message: 'Use a platform adapter instead.'},
                    {name: 'expo-localization', message: 'Use @/platform/localization instead.'},
                    {name: 'expo-sharing', message: 'Use @/platform/jsonFiles instead.'},
                    {name: 'i18next', message: 'Use @/platform/translations instead.'},
                    {name: 'react-i18next', message: 'Use @/platform/translations instead.'},
                ],
            }],
            'import/order': ['error', {
                groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
                pathGroups: [
                    {
                        pattern: '{react,react-native}',
                        group: 'external',
                        position: 'before',
                    },
                    {
                        pattern: '@/**',
                        group: 'internal',
                        position: 'before',
                    },
                ],
                pathGroupsExcludedImportTypes: ['builtin'],
                distinctGroup: true,
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            }],
            'react/jsx-closing-bracket-location': ['error', {
                nonEmpty: 'line-aligned',
                selfClosing: 'line-aligned',
            }],
            'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
            'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'always' }],
            'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
        },
    },
    {
        files: ['src/platform/**/*.{js,jsx,ts,tsx}'],
        rules: {
            'no-restricted-imports': 'off',
        },
    },
]);

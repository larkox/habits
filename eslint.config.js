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
        }
    },
]);

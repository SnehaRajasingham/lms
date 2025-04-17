import js from '@eslint/js';
import globals from 'globals';
import pluginJest from 'eslint-plugin-jest';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...pluginJest.environments.globals.globals,
      },
    },
    rules: {
      ...pluginJest.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.js'],
    plugins: {
      prettier: pluginPrettier,
    },
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      'prettier/prettier': ['error'],
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];

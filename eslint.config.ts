import js from '@eslint/js';
import json from '@eslint/json';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      'logs',
      '*.log',
      '.env',
      '.env.*',
      '.vscode',
      'generated',
      'prisma/migrations',
      'pnpm-lock.yaml',
    ],
  },
  {
    name: 'recommended-rules',
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'default-case': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  prettierConfig,
]);

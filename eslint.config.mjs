import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseJSONC } from 'jsonc-parser';
import globals from 'globals';

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prettier = parseJSONC(fs.readFileSync(path.join(__dirname, '.prettierrc.json'), 'utf8'));

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],

    ignores: ['**/*.njk', '**/*.swig', '**/*.md'],

    languageOptions: {
      parser: tsParser,

      ecmaVersion: 'latest',

      sourceType: 'module',

      globals: {
        ...globals.node,

        dataLayer: 'readonly',
        hexo: 'readonly',
        jQuery: 'readonly',
        $: 'readonly',
        _: 'readonly'
      }
    },

    linterOptions: {
      reportUnusedDisableDirectives: true
    },

    rules: {
      'prettier/prettier': ['error', prettier],

      '@typescript-eslint/explicit-function-return-type': 'off',

      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowDestructuring: false,
          allowedNames: ['self', 'hexo']
        }
      ],

      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],

      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off'
    }
  },

  {
    files: ['**/*.cjs'],

    languageOptions: {
      sourceType: 'commonjs'
    },

    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  },

  {
    files: ['**/*.{js,mjs,cjs}'],

    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  }
);

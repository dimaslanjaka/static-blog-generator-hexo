import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseJSONC } from 'jsonc-parser';
import tsParser from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prettier = parseJSONC(fs.readFileSync(path.join(__dirname, '.prettierrc.json'), 'utf8'));

export default [
  {
    files: ['**/*.{js,ts,cjs}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        dataLayer: true,
        hexo: true,
        jQuery: true,
        $: true,
        _: true
      },
      env: {
        browser: true,
        amd: true,
        node: true
      }
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': ['error', prettier],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowDestructuring: false,
          allowedNames: ['self', 'hexo']
        }
      ],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off'
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    settings: {},
    ignores: ['*.njk', '*.swig', '*.md'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended'
    ]
  },
  {
    files: ['*.js', '*.cjs', '*.mjs'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  }
];

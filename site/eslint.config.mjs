import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { fileURLToPath } from 'url';
import extendsFrom from '../eslint.config.mjs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    extends: extendsFrom,

    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'off'
    }
  }
]);

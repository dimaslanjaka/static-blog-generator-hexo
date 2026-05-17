import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonc from 'jsonc-parser';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const tsconfigContent = jsonc.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

// Priority: Env Var -> Hardcoded
const inputFile = process.env.ROLLUP_INPUT || 'src/index.ts';

// Regex Optimization:
// 1. Places 'd.ts' before 'ts' to ensure 'file.d.ts' becomes 'file' (not 'file.d')
// 2. Uses a non-capturing group (?:...) for slight performance improvement
const outputFile = (process.env.ROLLUP_OUTPUT || 'dist/index.js').replace(/\.(d\.ts|mjs|cjs|ts|js)$/, '');

/** @type {import('rollup').InputPluginOption} */
const plugins = [];
if (inputFile.endsWith('.ts')) {
  plugins.push(
    typescript({
      tsconfig: false,

      compilerOptions: {
        ...tsconfigContent.compilerOptions,

        // target: 'ES2020',
        // module: 'ESNext',
        // moduleResolution: 'bundler',

        declaration: false,
        composite: false,
        noEmit: false,

        outDir: './dist',

        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        allowJs: true,
        skipLibCheck: true,
        skipDefaultLibCheck: true
      },
      exclude: tsconfigContent.exclude || ['node_modules', 'dist']
    })
  );
}

/** @type {import('rollup').RollupOptions} */
export default {
  input: inputFile,

  output: [
    {
      file: `${outputFile}.cjs`,
      format: 'cjs',
      exports: 'auto',
      sourcemap: true
    },
    {
      file: `${outputFile}.mjs`,
      format: 'es',
      sourcemap: true
    }
  ],

  // Mark node_modules as external to avoid bundling them
  external: (id) => /node_modules/.test(id),

  plugins: [...plugins, resolve({ preferBuiltins: true }), commonjs()]
};

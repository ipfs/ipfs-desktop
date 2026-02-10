import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import love from 'eslint-config-love';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

const nodeFiles = [
  'src/**/*.{js,cjs,mjs}',
  'scripts/**/*.{js,mjs}',
  'pkgs/**/*.{js,mjs}',
  'test/**/*.{js,mjs}',
];

const browserFiles = [
  'src/webui/**/*.{js,mjs}',
];

const tsFiles = [
  'src/**/*.ts',
  'scripts/**/*.ts',
  'pkgs/**/*.ts',
  'test/**/*.ts',
  'types/**/*.ts',
];

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default [
  // Base rules from eslint-config-love.
  love,
  // Ignore config file itself.
  {
    ignores: ['eslint.config.mjs'],
  },
  // Main process / Node (JS + TS).
  {
    files: nodeFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  // Renderer / WebUI (JS + TS).
  {
    files: browserFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },
  // TypeScript files.
  {
    files: tsFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir,
        allowDefaultProject: true,
      },
    },
  },
];

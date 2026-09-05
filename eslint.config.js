import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.claude/**',      // agent worktrees are full copies of the repo
      'docker/**',       // backend is CommonJS, linted separately (npm test)
      'public_html/**',  // legacy shared-hosting leftovers
      'private/**',
      'server/**',
      'coverage',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        // typescript-eslint >= 8.6 refuses to guess when several tsconfig
        // candidates exist (root + scripts); pin the root explicitly.
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Lint re-enabled 2026-09-05 after ~8 months off. Errors block CI; the
      // rules below are warnings with a burn-down target, not accepted debt:
      //   no-explicit-any (20)  — house rule says no `any`; type them one PR at a time
      //   ban-ts-comment (14)   — @ts-ignore → @ts-expect-error with a reason
      //   react-hooks v7 "compiler" rules (40) — real findings, review case by case
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
    },
  }
);

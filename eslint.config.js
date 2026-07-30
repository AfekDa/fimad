import js from '@eslint/js'
import globals from 'globals'
import astro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'playwright-report',
      'test-results',
      'node_modules',
      '.astro',
      // Hand-authored static export, kept for sharing; not part of the build.
      'static',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Astro components: a JSX-like template plus a TypeScript frontmatter block.
  ...astro.configs.recommended,
  {
    /*
     * typescript-eslint has no resolver for `.astro` modules, so an imported
     * component is `any` to it and every call on a rendered element trips the
     * no-unsafe-* rules. These files are still fully type-checked — by
     * `astro check`, which does understand them (npm run typecheck).
     */
    files: ['**/*.test.ts', 'src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    // Node-side config and tooling files.
    files: ['astro.config.mjs', 'vitest.config.ts', 'playwright.config.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
)

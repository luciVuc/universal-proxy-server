// // eslint.config.js
// module.exports = {
//   env: {
//     es2021: true,
//     node: true,
//     jest: true,
//   },
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     ecmaVersion: 'latest',
//     sourceType: 'module',
//   },
//   plugins: ['@typescript-eslint', 'prettier'],
//   extends: ['eslint:recommended',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:prettier/recommended', // uses eslint-config-prettier + shows Prettier errors as lint errors
//   ],
//   rules: {
//     'prettier/prettier': 'error',
//   },
//   ignorePatterns: ['node_modules/',
//     'dist/',
//     'coverage/',
//     '*.config.js',
//     '*.config.cjs',
//     '*.config.mjs',
//     '.eslintrc.*',
//   ],
// };

// eslint.config.js
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  // // JavaScript/Node base config
  // js.config({
  //   files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
  //   ignores: ['node_modules/', 'dist/', 'coverage/', '*.config.js'],
  // }),
  // TypeScript config (for .ts and .tsx files)
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        ecmaVersion: '2021',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-type-checked'].rules,
      // Prefer Prettier formatting by making it an error
      'prettier/prettier': ['error'],
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  // Prettier (formatting) config
  {
    ...prettier,
    files: ['**/*.{js,ts,tsx,json,md}'],
  },
  // Ignore patterns (always ignored)
  {
    ignores: ['node_modules/',
      'dist/',
      'coverage/',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      '.eslintrc.*',
      '**/src/**/*.test.{js,ts}'
    ],
  },
];

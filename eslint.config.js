import stylistic from '@stylistic/eslint-plugin';
import json from '@eslint/json';
import css from '@eslint/css';

const stylisticConfig = stylistic.configs.customize({
  indent: 2,
  quotes: 'single',
  semi: true,
  arrowParens: true,
  quoteProps: 'consistent',
  commaDangle: 'only-multiline',
  braceStyle: '1tbs',
});

stylisticConfig.files = ['**/*.js'];
stylisticConfig.rules = {
  ...stylisticConfig.rules,
  '@stylistic/operator-linebreak': 'off'
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.git/**', 'package-lock.json'],
  },
  stylisticConfig,
  {
    files: ['**/*.json'],
    language: 'json/json',
    plugins: {
      json,
    },
    rules: {
      'json/no-duplicate-keys': 'error',
      'json/no-empty-keys': 'error',
      'json/no-unnormalized-keys': 'error',
      'json/no-unsafe-values': 'error',
    },
  },
  {
    files: ['**/*.css'],
    plugins: {
      css,
    },
    language: 'css/css',
    languageOptions: {
      tolerant: true,
    },
    rules: {
      'css/no-duplicate-imports': 'error',
      'css/no-empty-blocks': 'error',
      'css/no-invalid-at-rules': 'error',
      'css/no-invalid-properties': 'off',
    },
  },
];

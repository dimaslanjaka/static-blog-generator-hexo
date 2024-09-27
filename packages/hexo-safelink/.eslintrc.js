const prettier = require('./.prettierrc');

/**
 * @type {import('eslint').ESLint.ConfigData}
 */
const config = {
  extends: [
    'hexo',
    'plugin:@typescript-eslint/eslint-recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended' // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  root: true,
  rules: {
    'prettier/prettier': ['error', prettier],
    strict: 'off'
  },
  globals: { hexo: true },
  // override rules for js files
  overrides: [
    {
      files: ['*.js', '*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // disable require warning on js files
        '@typescript-eslint/no-require-imports': 'off', // disable ES6-style imports over require()
        '@typescript-eslint/triple-slash-reference': 'off' // disable include refenrences definition files on js
      }
    },
    {
      files: ['*.ts'],
      rules: {
        'node/no-unsupported-features/es-syntax': 'off'
      }
    }
  ]
};

module.exports = config;

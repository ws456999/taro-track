const config = require('../../.eslintrc.js')

module.exports = {
  ...config,
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  rules: {
    'prefer-const': 2,
    'no-undef': 2,
    '@typescript-eslint/no-unused-vars': 2,
    '@typescript-eslint/no-var-requires': 0,
  },
}

module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "globals": {
    "Page": true,
    "WechatMiniprogram": true,
    "wx": true,
    "getCurrentPages": true
  },
  "rules": {
    "prefer-const": 2,
    "no-undef": 2,
    "@typescript-eslint/no-unused-vars": 2,
  }
};

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    webextensions: true,
    'jest/globals': true
  },
  extends: [
    'standard',
    'plugin:jest/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
  },
  plugins: [
    'jest'
  ]
}

module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_',
      'destructuredArrayIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }]
  }
};

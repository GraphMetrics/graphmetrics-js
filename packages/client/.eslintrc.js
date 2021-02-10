const path = require('path');
const config = require('../../.eslintrc.js');

config.parserOptions.project.push(path.join(__dirname, 'tsconfig.json'));
config.rules = {
  ...config.rules,
  '@typescript-eslint/ban-types': 0,
};

module.exports = config;

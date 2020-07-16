const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const configMode = isProd ? 'production' : 'development';
const resolve = p => path.resolve(process.cwd(), p);

module.exports = {
  isProd,
  configMode,
  resolve
};

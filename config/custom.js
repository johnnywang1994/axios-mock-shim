const { isProd } = require('./utils');

module.exports = {
  globalName: {
    root: 'AxiosMockShim',
    amd: 'axios-mock-shim',
    commonjs: 'axios-mock-shim'
  },
  fileName: isProd ? 'axios-mock-shim.min.js' : 'axios-mock-shim.js',
};

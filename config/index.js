const { configMode, resolve } = require('./utils');
const customConfig = require('./custom');

const config = {
  mode: configMode,
  entry: resolve('src/index.ts'),
  output: {
    path: resolve('dist'),
    filename: customConfig.fileName,
    library: {
      root: customConfig.globalName.root,
      amd: customConfig.globalName.amd,
      commonjs: customConfig.globalName.commonjs
    },
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: [
          'babel-loader',
          'ts-loader'
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [
      '.tsx',
      '.ts',
      '.js'
    ],
  },
  externals: {
    axios: 'axios',
    'axios-mock-adapter': {
      root: 'AxiosMockAdapter',
      amd: 'axios-mock-adapter',
      commonjs: 'axios-mock-adapter',
      commonjs2: 'axios-mock-adapter'
    }
  },
};

module.exports = config;

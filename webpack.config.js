import path from 'path';
import webpack from 'webpack';

export default {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './md2word.js',
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve('build'),
    filename: 'md2word-web.bundle.js',
    library: {
      type: 'module',
    },
  },
  module: {
    rules: [{
      test: /\.xml$/i,
      use: 'raw-loader',
    }],
  },
  resolve: {
    fallback: {
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
      'buffer': 'buffer/',
      'fs': false,
      'path': false,
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ]
};

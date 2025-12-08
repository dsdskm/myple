const path = require('path');

module.exports = {
  // 기존 설정
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"), // crypto 폴리필
      // 필요한 다른 모듈도 추가 가능
      // "stream": require.resolve("stream-browserify"),
      // "http": require.resolve("stream-http"),
      // "https": require.resolve("https-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
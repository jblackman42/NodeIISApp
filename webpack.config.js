const path = require('path');

module.exports = {
  mode: 'production',
  entry: './widgets/PHCWidgets.jsx',
  output: {
    filename: 'PHCWidgets.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'https://dev.phc.events/widgets/dist/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      }
    ],
  }
};
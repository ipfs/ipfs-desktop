var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'eval',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
  },
  entry: {
    menubar: [
      'webpack-hot-middleware/client',
      './app/js/menubar'
    ],
    settings: [
      'webpack-hot-middleware/client',
      './app/js/settings'
    ],
    welcome: [
      'webpack-hot-middleware/client',
      './app/js/welcome'
    ],
    help: [
      'webpack-hot-middleware/client',
      './app/js/help'
    ]
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'app')
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }]
  },
  target: 'atom'
}

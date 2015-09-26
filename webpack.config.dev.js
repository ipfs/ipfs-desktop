var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'eval',
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: path.join(__dirname, 'app'),
      query: {
        optional: ['runtime']
      }
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }, {
      test: /\.less$/,
      loaders: ['style', 'css', 'less']
    }, {
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loaders: ['file']
    }]
  }
}

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
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }, {
      test: /\.less$/,
      loaders: ['style', 'css', 'less']
    }, {
      test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/,
      loader: 'file-loader?name=[name].[ext]'
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/,
      loader: 'file-loader?name=[name].[ext]'
    }, {
      test: /\.(png|gif|jpg|jpeg)$/,
      loader: 'file-loader?name=[name].[ext]'
    }]
  }
}

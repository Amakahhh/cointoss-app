const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('@tailwindcss/postcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Cointoss - Predict Crypto Trends'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    // Add CORS proxy for development
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq: (proxyReq, req, res) => {
          console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.url}`);
        },
        onError: (err, req, res) => {
          console.error(`[PROXY ERROR] ${err.message} for ${req.url}`);
        }
      }
      // Note: WebSocket connections are established directly to the backend
      // in development (see src/services/websocket.js). Removing the '/ws'
      // proxy prevents webpack-dev-server's websocket proxy from crashing
      // on some Windows setups (ERR_STREAM_WRITE_AFTER_END).
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};


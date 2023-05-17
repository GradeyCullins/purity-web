const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: {
    worker: path.join(__dirname, 'src/worker.ts'),
    popup: path.join(__dirname, 'src/popup/index.tsx'),
    content: path.join(__dirname, 'src/content.ts')
  },
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      // Treat src/css/app.css as a global stylesheet
      {
        // test: /app.css$/,
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      // Load .module.css files as CSS modules
      {
        test: /\.module.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'postcss-loader'
        ]
      }
    ]
  },
  // Setup @src path resolution for TypeScript files
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@src': path.resolve(__dirname, 'src/')
    }
  },
  plugins: [
    // CSS copier
    new CopyPlugin({
      patterns: [{ from: '.', to: '../css', context: 'src/css' }]
    }),
    new webpack.DefinePlugin({
      MODE: JSON.stringify(process.env.MODE),
      API_URL: JSON.stringify(process.env.API_URL)
    })
  ]
}

const path = require("path");
const webpack = require("webpack");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  entry: {
    index: './src/main.js',
    main: './src/app.js'
  },
  output: {
    path: path.resolve(process.cwd(), "docs"),
    publicPath: ""
  },
	node: {
   fs: "empty",
	 net: "empty"
	},
  watchOptions: {
    // ignored: /node_modules/,
    aggregateTimeout: 300, // After seeing an edit, wait .3 seconds to recompile
    poll: 500 // Check for edits every 5 seconds
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body',
      chunks: ['index', 'main'],
      filename: 'index.html'
    }),

    new HtmlWebpackPlugin({
        template: './public/admin.html',
        inject: 'body',
        chunks: ['index', 'main'],
        filename: 'admin.html'
      }),

    new HtmlWebpackPlugin({
        template: './public/student.html',
        inject: 'body',
        chunks: ['main'],
        filename: 'student.html'
      }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },

      {
        test: /\.(png|jpg|jp(e*)g)$/,
        use: [
            {
                loader: 'url-loader',
                options: {
                    name: '[name].[hash:20].[ext]',
                    limit: 8192
                }
            }
        ]
    }
    ]
  },
}
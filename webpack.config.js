const nodeExternals = require("webpack-node-externals");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  return {
    entry: { app: "./src/server.ts" },
    externalsPresets: { node: true },
    context: __dirname,

    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "/dist"),
      filename: "ejs-api.js",
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: "package.json" },
          { from: "package-lock.json" },
          { from: "env/default.json" },
          { from: `env/${env.APP_ENV}.json` },
          {
            from: path.resolve(__dirname, 'src/templates'),
            to: path.resolve(__dirname, 'dist/templates'), // Copy templates to the dist directory
          },
          {
            from: path.resolve(__dirname, 'src/styles'),
            to: path.resolve(__dirname, 'dist/styles'), // Copy templates to the dist directory
          },
        ],
      }),
      new webpack.DefinePlugin({
        "process.env.APP_ENV": JSON.stringify(env.APP_ENV),
      }),
    ],
    node: {
      __dirname: true,
    },
    resolve: {
      extensions: [".ts", ".js", ".json", ".html", ".css"],
    },
    module: {
      rules: [
        {
          use: [
            {
              loader: "ts-loader",
            },
          ],
        },
        {
          test: /\.html$/,
          use: 'html-loader', // This allows Webpack to bundle HTML templates
        },
      ],
    },
  };
};
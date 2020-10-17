var loaders = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.js$/, loader: "source-map-loader" },
];

module.exports = [
  {
    entry: './lib/index.js',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist',
        libraryTarget: 'amd'
    },
    module: {
      loaders: loaders
    },
    devtool: 'source-map',
    externals: ['@jupyter-widgets/base'],
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    },

  },
];

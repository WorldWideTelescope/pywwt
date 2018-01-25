var loaders = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.json$/, loader: 'json-loader' },
  { test: /\.js$/, loader: "source-map-loader" },
];

module.exports = [
  {
    // Notebook extension
    entry: './lib/index.js',
    output: {
      filename: 'index.js',
      path: __dirname + '/pywwt/nbextension/static',
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
    }
  },

  {
    // embeddable bundle (e.g. for docs)
    entry: './lib/index.js',
    output: {
        filename: 'embed-bundle.js',
        path: __dirname + '/docs/source/_static',
        library: "pywwt",
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

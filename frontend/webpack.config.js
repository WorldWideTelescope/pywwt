module.exports = [
  {
    mode: 'production',
    entry: './lib/index.js',
    output: {
      filename: 'bundle.js',
      path: __dirname + '/dist',
      libraryTarget: 'amd',
    },
    module: {
      rules: [
        {
          test: /^lib\/.*\.js$/,
          use: [
            'source-map-loader',
            {
              loader: 'source-map-loader',
            },
          ],
        },
      ],
    },
    devtool: 'source-map',
    externals: ['@jupyter-widgets/base'],
    resolve: {
      extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
  },
];

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [/node_modules\/jspdf/], // Tell it to ignore jspdf maps
      },
    ],
  },
};
var path = require("path");
var autoprefixer = require("autoprefixer");

module.exports = {
  context: __dirname,
  entry: "./js/main.js",
  output: {
    path: path.join(__dirname, 'js'),
    filename: "bundle.js",
    devtoolModuleFilenameTemplate: '[resourcePath]',
    devtoolFallbackModuleFilenameTemplate: '[resourcePath]?[hash]'
  },
  module: {
    loaders: [{
      test:   /\.css$/,
      loader: "style-loader!css-loader!postcss-loader"
  }]},
    postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ]
};

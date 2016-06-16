var path = require("path");

module.exports = {
  context: __dirname,
  entry: "./js/main.js",
  output: {
    path: path.join(__dirname, 'js'),
    filename: "bundle.js",
    devtoolModuleFilenameTemplate: '[resourcePath]',
    devtoolFallbackModuleFilenameTemplate: '[resourcePath]?[hash]'
  },
};

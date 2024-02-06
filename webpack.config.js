const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    content: './src/content.js',
    background: './src/background.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: '[name].js' // Output bundle file, [name] will be replaced by the entry point name
  },
  // mode: 'development',
  mode: 'production',
  plugins: [
    new Dotenv() // Load the .env file
  ],
};

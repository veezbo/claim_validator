const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/content.js', // Your main script file
  output: {
    path: path.resolve(__dirname, 'src'), // Output directory
    filename: 'bundle.js' // Output bundle file
  },
  // mode: 'development',
  mode: 'production',
  plugins: [
    new Dotenv() // Load the .env file
  ],
};

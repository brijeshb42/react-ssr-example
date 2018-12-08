const path = require('path');
const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss(path.join(__dirname, 'tailwind.js')),
    require('precss'),
    require('autoprefixer')
  ]
}

const path = require('path');
const srcPath = path.resolve(path.join(path.dirname(__dirname), 'src'));

const resolve = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  alias: {
    '@shared': path.join(srcPath, 'shared'),
  },
};

module.exports = {
  resolve,
  srcPath,
};

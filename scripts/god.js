const path = require('path');
const nodemon = require('nodemon');
const log = require('debug')('dev:god');

const scriptPath = path.resolve(path.join(__dirname, 'startdevserver.js'));
const basePath = path.dirname(path.dirname(scriptPath));

log('God is watching');

nodemon({
  script: scriptPath,
  watch: [
    path.resolve(__dirname),
    path.join(basePath, 'configs'),
    path.join(basePath, 'package.json'),
  ]
}).on('quit', () => {
  log('K Thx Bye');
  process.exit();
}).on('restart', () => {
  log('Scripts or config changed. Restarting everything.');
});

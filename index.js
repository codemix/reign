try {
  module.exports = require('./lib');
}
catch (e) {
  require('babel-polyfill');
  module.exports = require('./lib-legacy');
}

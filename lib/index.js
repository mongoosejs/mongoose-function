// mongoose-function

module.exports = exports = function (mongoose, opts) {
  require('./type')(mongoose, opts);
  return require('./schema')(mongoose);
}

exports.version = require('../package').version;


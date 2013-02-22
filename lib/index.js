// mongoose-function

module.exports = exports = function (mongoose) {
  require('./type')(mongoose);
  return require('./schema')(mongoose);
}

exports.version = require('../package').version;


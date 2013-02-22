
module.exports = exports = function (mongoose) {
  function MongooseFunction () {
    var arg = arguments[0];
    var type = typeof arg;
    var fn;

    if ('string' == type && /^function\s*[^\(]*\(/.test(arg)) {
      // convert from stored fn
      fn = toFunction(arg);
    } else if ('function' == type) {
      fn = arg;
    } else if ('object' == type && 'Code' == arg._bsontype) {
      if (arg.scope && Object.keys(arg.scope).length > 0) {
        throw new Error('MongooseFunction does not support storing Code `scope`')
      }
      fn = toFunction(arg.code);
    } else {
      fn = Function.apply(undefined, arguments);
    }

    // compatibility with mongoose save
    // TODO document this difference compared to regular fns
    fn.valueOf = fn.toString;
    fn.__MongooseFunction__ = 1;

    return fn;
  }

  return mongoose.Types.Function = MongooseFunction;
}

// avoid v8 deopt
function toFunction (arg) {
  'use strict';
  return eval('(' + arg + ')');
}

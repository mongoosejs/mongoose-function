var util = require('util')

module.exports = exports = function (mongoose) {
  var CastError = mongoose.Error.CastError;
  var SchemaTypes = mongoose.SchemaTypes;
  var Code = mongoose.mongo.Code;
  var FN = mongoose.Types.Function;

  function Function (path, options) {
    mongoose.SchemaType.call(this, path, options);
  }

  util.inherits(Function, mongoose.SchemaType);

  // allow { required: true }
  Function.prototype.checkRequired = function (value) {
    return undefined !== value;
  }

  // cast to a function
  Function.prototype.cast = function (val) {
    if (null === val) {
      return val;
    }

    var type = typeof val;

    switch (type) {
      case 'function':
        return val.__MongooseFunction__
          ? val
          : FN(val)

      case 'object':
        if ('Code' == val._bsontype) {
          return FN(val);
        }

        // fall through

      default:
        if ('string' != type) {
          throw new CastError('Function', val, this.path);
        }

        return FN(val);
    }
  }

  function handleSingle (val) {
    return this.castForQuery(val);
  }

  function handleArray (val) {
    var self = this;
    return val.map(function (m) {
      return self.castForQuery(m);
    });
  }

  Function.prototype.$conditionalHandlers = {
      '$ne' : handleSingle
    , '$in' : handleArray
    , '$nin': handleArray
    , '$gt' : handleSingle
    , '$lt' : handleSingle
    , '$gte': handleSingle
    , '$lte': handleSingle
    , '$all': handleArray
    , '$regex': handleSingle
    , '$options': handleSingle
  };

  /**
   * Functions are stored as strings in MongoDB
   *
   * We don't use mongo.Code b/c it doesn't allow for searching
   * by regular expressions, only exact matches.
   */

  Function.prototype.castForQuery = function ($conditional, val) {
    var handler;
    if (2 === arguments.length) {
      handler = this.$conditionalHandlers[$conditional];
      if (!handler) {
        throw new Error("Can't use " + $conditional + " with Function.");
      }
      return handler.call(this, val);
    } else {
      val = $conditional;
      if (val instanceof RegExp) return val;
      if (val && 'Code' == val._bsontype) return String(val.code);
      return String(val);
    }
  }

  /**
   * expose
   */

  return SchemaTypes.Function = Function;
}

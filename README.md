#mongoose-function
===================

Provides [Mongoose](http://mongoosejs.com) support for storing functions.

[![Build Status](https://secure.travis-ci.org/aheckmann/mongoose-function.png)](http://travis-ci.org/aheckmann/mongoose-function)

Example:

```js
var mongoose = require('mongoose')
require('mongoose-function')(mongoose);

var mySchema = Schema({ func: Function });
var M = mongoose.model('Functions', mySchema);

var m = new M;
m.func = function(){
  console.log('stored function')
}
m.save(function (err) {
  M.findById(m._id, function (err, doc) {
    doc.func(); // logs "stored function"
  });
});
```

Storing function scope isn't supported. Just store it in a separate document property.

#### MongooseFunction Differences

The only difference between a `MongooseFunction` and a native function is `MongooseFunction.valueOf()` returns a string instead of the function itself. This is for compatibility with Mongoose.

#### BSON Code

`MongooseFunction` does not store functions using the `Code` BSON type. The reason for this is that `Code` does not allow for searching by `RegExp`. As such, storing function scope is not directly supported, instead, store the scope in another document property.

### install

```
npm install mongoose-function
```

[LICENSE](https://github.com/aheckmann/mongoose-function/blob/master/LICENSE)

#mongoose-function
===================

Provides [Mongoose](http://mongoosejs.com) support for storing functions.

[![Build Status](https://travis-ci.org/aheckmann/mongoose-function.png?branch=master)](http://travis-ci.org/aheckmann/mongoose-function)

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

#### Security

- string arguments are first trimmed
- empty strings are cast to `null`
- strings MUST begin with "function" or casting will fail
- all string content after the function closes is ignored (`"function a(){ return 108 } thisIsIgnored()"`)
- only valid function strings (per above rules), `Code` instances, functions, or `null` values are permitted

We are validating function validity but not function content. Side affects of function execution are not guaranteed to be safe. **You are responsible for validating function safety before execution.** For example, if function content is updated in the database to something that would do something destructive like remove files, drop database collections, etc, and you execute that function, you've been warned.

#### Custom Function Conversion

If you'd like to perform custom conversion logic or further validate function contents, you may override the default converter like so:

```js
var mongoose = require('mongoose')
require('mongoose-function')(mongoose, { toFunction: YourCustomConverter });
```

Now, whenever `mongoose.Types.Function.toFunction` would have been called, `YourCustomConverter` will be called instead.

Custom conversion functions MUST return either a `function` or `null` to be considered valid, otherwise a `CastError` will occur. ( _NOTE: mongoose CastErrors do not show up until the document is saved_ ).

If you'd like to use the default converter but perform some additional validation on the retuned function, you might set up your converter like so:

```js
var mongoose = require('mongoose')
require('mongoose-function')(mongoose, { toFunction: YourCustomConverter });
var convert = mongoose.Types.Function.toFunction;

function YourCustomConverter () {
  var res = convert.apply(undefined, arguments);
  if (null === res) return res;

  // validate res function contents here
  // ...
  return res
}
```

#### MongooseFunction Differences

The only difference between a `MongooseFunction` and a native function is `MongooseFunction.valueOf()` returns a string instead of the function itself. This is for compatibility with Mongoose.

#### BSON Code

`MongooseFunction` does not store functions using the `Code` BSON type. The reason for this is that `Code` does not allow for searching by `RegExp`. As such, storing function scope is not directly supported, instead, store the scope in another document property.

### install

```
npm install mongoose-function
```

[LICENSE](https://github.com/aheckmann/mongoose-function/blob/master/LICENSE)

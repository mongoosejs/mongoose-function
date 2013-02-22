#mongoose-function
===================

Provides [Mongoose](http://mongoosejs.com) support for storing functions and associated scope data.

[![Build Status](https://secure.travis-ci.org/aheckmann/mongoose-function.png)](http://travis-ci.org/aheckmann/mongoose-function)

Example:

```js
var mongoose = require('mongoose')
require('mongoose-function')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
var mySchema = Schema({ func: SchemaTypes.Function });
var M = mongoose.model('Functions', mySchema);

var m = new M;
m.func = function(){
  console.log('stored function')
}
m.save(function (err) {
  M.findById(m._id, function (err, doc) {
    doc.func(); // stored function
  });
});
```

Storing function scope isn't supported. Just store it in a separate document property.

### install

```
npm install mongoose-function
```

[LICENSE](https://github.com/aheckmann/mongoose-function/blob/master/LICENSE)

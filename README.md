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

### install

```
npm install mongoose-function
```

[LICENSE](https://github.com/aheckmann/mongoose-function/blob/master/LICENSE)

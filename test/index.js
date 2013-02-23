
var assert = require('assert')
var Mod = require('../')
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var FunctionSchema;
var MongooseFunction;

describe('MongooseFunction', function(){
  before(function(){
    FunctionSchema = Mod(mongoose)
    MongooseFunction = mongoose.Types.Function
  })

  it('has a version', function(){
    assert.equal(require('../package').version, Mod.version);
  })

  it('is a function', function(){
    assert.equal('function', typeof FunctionSchema);
  })

  it('extends mongoose.Schema.Types', function(){
    assert.ok(Schema.Types.Function);
    assert.equal(FunctionSchema, Schema.Types.Function);
  })

  it('extends mongoose.Types', function(){
    assert.ok(mongoose.Types.Function);
  })

  it('can be used in schemas', function(){
    var s = new Schema({ fn: FunctionSchema });
    var fn = s.path('fn')
    assert.ok(fn instanceof mongoose.SchemaType);
    assert.equal('function', typeof fn.get);

    var s = new Schema({ fn: 'Function' });
    var fn = s.path('fn')
    assert.ok(fn instanceof mongoose.SchemaType);
    assert.equal('function', typeof fn.get);

    var s = new Schema({ fn: Function });
    var fn = s.path('fn')
    assert.ok(fn instanceof mongoose.SchemaType);
    assert.equal('function', typeof fn.get);
  })

  describe('integration', function(){
    var db, S, schema, id;

    before(function(done){
      db = mongoose.createConnection('localhost', 'mongoose_function')
      db.once('open', function () {
        schema = new Schema({
            fn: FunctionSchema
          , docs: [{ fn: Function }]
        });
        S = db.model('MFunction', schema);
        done();
      });
    })

    after(function(done){
      db.db.dropDatabase(function () {
        db.close(done);
      });
    })

    describe('casts', function(){
      it('functions', function(){
        var v = function () { return 3 + 9; }
        var s = new S({ fn: v });
        assert.equal('function', typeof s.fn);
        assert.equal(s.fn, v);
        assert.equal(12, s.fn());

        v = new Function('return 5 + 3');
        s = new S({ fn: v });
        assert.equal(s.fn, v);
        assert.equal(8, s.fn());
      });

      describe('strings', function(){
        it('with length', function(){
          var v = 'function \n\r woot (){ return "Mario64" }';
          var s = new S({ fn: v });
          assert.equal('function', typeof s.fn);
          assert.equal('Mario64', s.fn());
        })
        it('with length that do not start with "function"', function(){
          var v = 'return "Mario64"';
          var s = new S({ fn: v });
          assert.equal('undefined', typeof s.fn);
        })
        it('that are empty', function(){
          var v = '';
          var s = new S({ fn: v });
          assert.strictEqual(null, s.fn);
        })
      });

      it('null', function(){
        var s = new S({ fn: null });
        assert.equal(null, s.fn);
      })

      it('MongooseFunction', function(){
        var s = new S({ fn: new mongoose.Types.Function("function(){return 90}") });
        assert.equal('function', typeof s.fn);
        assert.equal(90, s.fn());
      })

      it('non-castables produce _saveErrors', function(done){
        var schema = new Schema({ fn: 'Function' }, { strict: 'throw' });
        var M = db.model('throws', schema);
        var m = new M({ fn: [] });
        m.save(function (err) {
          assert.ok(err);
          assert.equal('Function', err.type);
          assert.equal('CastError', err.name);
          done();
        });
      })

      it('queries with null properly', function(done){
        S.create({ fn: null }, { fn: ' function (){  return 1 } ' }, function (err) {
          assert.ifError(err);
          S.findOne({ fn: null }, function (err, doc) {
            assert.ifError(err);
            assert.strictEqual(null, doc.fn);
            done();
          })
        })
      })

      it('Code', function(done){
        var v = function () { return 3 + 9; }
        var scope = { x: 1 };
        var code = new mongoose.mongo.Code(v, scope);
        var s = new S({ fn: code });
        s.save(function (err) {
          assert.ok(/MongooseFunction does not support storing Code `scope`/, err);

          v = function () { return 3 + 9; }
          s.fn = new mongoose.mongo.Code(v);
          assert.equal('function', typeof s.fn);
          assert.equal(12, s.fn());
          done();
        })
      })
    })

    describe('with db', function(){
      it('save', function(done){
        function Ab_eiot43$() { return 20 }

        function
         multiline
          () {

            return 100;
        }

        var s = new S({
            fn: 'function  \n\rn (a, b, c )  {return 10; 3}'
          , docs: [
                { fn: Ab_eiot43$ }
              , { fn: function      stuff     (      ) {return 1 } }
              , { fn: multiline }
            ]
        });
        id = s.id;
        s.save(function (err) {
          assert.ifError(err);
          done();
        })
      })

      var fnStr;
      it('findById', function(done){
        S.findById(id, function (err, doc) {
          assert.ifError(err);
          assert.ok('function' == typeof doc.fn);
          assert.equal(
              131
            , doc.fn() + doc.docs[0].fn() + doc.docs[1].fn() + doc.docs[2].fn()
          );
          fnStr = doc.fn.toString();
          done();
        });
      })

      it('find', function(done){
        S.find({ fn: fnStr }, function (err, docs) {
          assert.ifError(err);
          assert.equal(1, docs.length);
          var doc = docs[0];
          assert.ok('function' == typeof doc.fn);
          assert.equal(
              131
            , doc.fn() + doc.docs[0].fn() + doc.docs[1].fn() + doc.docs[2].fn()
          );
          done();
        });
      })

      it('find with RegExp', function(done){
        S.find({ fn: /return 10/, 'docs.fn': new RegExp('^function', 'i') }, function (err, docs) {
          assert.ifError(err);
          assert.equal(1, docs.length);
          var doc = docs[0];
          assert.ok('function' == typeof doc.fn);
          assert.equal(
              131
            , doc.fn() + doc.docs[0].fn() + doc.docs[1].fn() + doc.docs[2].fn()
          );
          done();
        });
      })

      describe('is updateable', function(){
        it('in general', function(done){
          S.findById(id, function (err, doc) {
            assert.ifError(err);
            doc.fn = function(){ return require('mongoose').version }
            doc.save(function (err) {
              assert.ifError(err);
              S.findById(id, function (err, doc) {
                assert.ifError(err);
                assert.equal(mongoose.version, doc.fn());
                done();
              });
            })
          })
        })
      })

      describe('with mongodb.Code', function(){
        it('works', function(done){
          var v = function () { return 3 + 9; }
          var code = new mongoose.mongo.Code(v);
          var s = new S({ fn: code });
          s.save(function (err) {
            assert.ifError(err);
            S.findById(s._id, function (err, doc) {
              assert.ifError(err);
              assert.equal(12, doc.fn());
              done();
            })
          })
        })
      })
    })

    it('can be required', function(done){
      var s = new Schema({ fn: { type: Function, required: true }});
      var M = db.model('required', s);
      var m = new M;
      m.save(function (err) {
        assert.ok(err);
        m.fn = console.log;
        m.validate(function (err) {
          assert.ifError(err);
          done();
        })
      })
    })

    describe('security', function(){
      it('handles values returned from db', function(done){
        S.create({ docs: [] }, function (err, doc) {
          assert.ifError(err);

          var docs = [];
          docs[0] = { fn: ' ' }
          docs[1] = { fn: ' function  \n ok (a) \r\n  { return { a: a\n\r }\n}}}' }
          docs[2] = { fn: 'function c(){ process.stdout.write("gotcha") }' }
          docs[3] = { fn: 'eval(5)' }

          S.collection.update(
              { _id: doc._id }
            , { $set: { docs: docs }}
            , { w: 1 }, function (err) {
            assert.ifError(err);

            S.findById(doc._id, function (err, doc) {
              assert.ifError(err);
              assert.equal(null, doc.docs[0].fn);
              assert.equal(4, doc.docs[1].fn(4).a);
              assert.equal(undefined, doc.docs[2].fn());
              assert.equal(undefined, doc.docs[3].fn);
              done()
            })
          })
        })
      })

      describe('custom toFunction', function(){
        it('can be set by user', function(done){
          delete mongoose.Types.Function;
          delete mongoose.Schema.Types.Function;

          var custom = false;

          function toFunction (str) {
            custom = true;
            return eval('(' + str + ')');
          }

          Mod(mongoose, { toFunction: toFunction })

          var schema = new Schema({
              fn: FunctionSchema
          });
          var M = db.model('MFunction2', schema);

          var m= new M({ fn: 'function () { return 10 + 10 }' })
          assert.equal(20, m.fn());
          assert.ok(custom);

          m = new M({ fn: 'return 10 + 10' });
          assert.equal('undefined', typeof m.fn);
          m.save(function (err) {
            assert.ok(err);

            m.fn = 'function () { return "worked" }'
            assert.equal('worked', m.fn());

            m.save(function (err) {
              assert.ifError(err);
              M.findById(m._id, function (err, doc) {
                assert.ifError(err);
                assert.equal('worked', doc.fn());
                done()
              })
            })
          })
        })
        it('must return functions or null', function(done){
          var M = db.model('MFunction2');

          var m= new M({ fn: '{ toString: "fail" }' })
          assert.equal('undefined', typeof m.fn);
          var m= new M({ fn: '[]' })
          assert.equal('undefined', typeof m.fn);
          var m= new M({ fn: 'return "hm"' })
          assert.equal('undefined', typeof m.fn);
          var m= new M({ fn: '10' })
          assert.equal('undefined', typeof m.fn);
          var m= new M({ fn: 'new RegExp(".*")' })
          assert.equal('undefined', typeof m.fn);
          var m= new M({ fn: new mongoose.mongo.Code('null') })
          assert.strictEqual(null, m.fn);
          done();
        })
      })
    })
  })

})

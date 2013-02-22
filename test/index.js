
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
          var v = 'return "Mario64"';
          var s = new S({ fn: v });
          assert.equal('function', typeof s.fn);
          assert.equal('Mario64', s.fn());
        })
        it('that are empty', function(){
          var v = '';
          var s = new S({ fn: v });
          assert.equal('function', typeof s.fn);
          assert.equal(undefined, s.fn());
        })
      });

      it('null', function(){
        var s = new S({ fn: null });
        assert.equal(null, s.fn);
      })

      it('MongooseFunction', function(){
        var s = new S({ fn: new mongoose.Types.Function("return 90") });
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
        S.create({ fn: null }, { fn: 'return 1' }, function (err) {
          assert.ifError(err);
          S.findOne({ fn: null }, function (err, doc) {
            assert.ifError(err);
            assert.strictEqual(null, doc.fn);
            done();
          })
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
            fn: 'return 10'
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
                assert.equal('3.5.6', doc.fn());
                done();
              });
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
  })
})

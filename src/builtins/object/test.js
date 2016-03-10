describeRealm('Builtin: Object', function (options) {
  let realm;
  let backing;
  let T;
  let address;
  let obj;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Object.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      (T.Object() === null).should.equal(true);
    });

    it('should return an object from an object', function () {
      T.Object({a: 1, b: 2, c: 3}).should.eql({a: 1, b: 2, c: 3});
    });

    it('should return an object from a string', function () {
      T.Object('abc').should.eql(String('abc'));
    });

  });

  describe('.constructor()', function () {


    it('should create a new empty instance', function () {
      obj = new T.Object();
    });

    it('should not have any keys', function () {
      Object.keys(obj).length.should.equal(0);
    });

    it('should create a new instance with a single key', function () {
      obj = new T.Object({greeting: 'hello world'});
    });

    it('should have a single key', function () {
      Object.keys(obj).should.eql(['greeting']);
    });

    it('should get a field value', function () {
      obj.greeting.should.equal('hello world');
    });

    it('should set a field value', function () {
      obj.greeting = 'yo';
    });

    it('should have updated the value', function () {
      obj.greeting.should.equal('yo');
    });

    it('should create a new instance with multiple keys', function () {
      obj = new T.Object({a: 1, b: true, c: 'yo'});
    });

    it('should have 3 keys', function () {
      Object.keys(obj).should.eql(['a', 'b', 'c']);
    });

    it('should get each field', function () {
      obj.a.should.equal(1);
      obj.b.should.equal(true);
      obj.c.should.equal('yo');
    });

    it('should set each field', function () {
      obj.a = 'a';
      obj.b = 2;
      obj.c = null;
    });

    it('should get each field again', function () {
      obj.a.should.equal('a');
      obj.b.should.equal(2);
      (obj.c === null).should.equal(true);
    });

    it('should jsonify the object', function () {
      JSON.parse(JSON.stringify(obj)).should.eql({
        a: 'a',
        b: 2,
        c: null
      });
    });

    it('should store a nested object', function () {
      obj = new T.Object({
        a: 1,
        b: {
          c: 3,
          d: null
        }
      });
    });

    it('should get each field', function () {
      obj.a.should.equal(1);
      obj.b.c.should.equal(3);
      (obj.b.d === null).should.equal(true);
    });

    it('should refer to itself', function () {
      obj.d = obj;
    });

    it('should get itself', function () {
      obj.d.b.c.should.equal(3);
    });
  });


  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      (T.Object.emptyValue() === null).should.equal(true);
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.Object.randomValue();
      (value === null).should.equal(true);
    });

    it('should accept a random value', function () {
      T.Object.accepts(T.Object.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .clear()', function () {
    it('should initialize an address', function () {
      T.Object.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      (T.Object.load(backing, address) === null).should.equal(true);
    });

    it('should store a typed object at an address', function () {
      T.Object.store(backing, address, {a: 1, b: 2, c: 3});
    });

    it('should load a typed object from an address', function () {
      T.Object.load(backing, address).should.eql({a: 1, b: 2, c: 3});
    });

    it('should store a vanilla object value at an address', function () {
       T.Object.store(backing, address, {a: 1, b: 2, c: 3});
    });

    it('should load a vanilla object value from an address', function () {
      T.Object.load(backing, address).should.eql({a: 1, b: 2, c: 3});
    });

    it('should clear a value from an address', function () {
      T.Object.clear(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.Object.load(backing, address) === null).should.equal(true);
    });

    it('should perform a few gc cycles', function () {
      backing.gc.cycle();
      backing.gc.cycle();
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.Object.hashValue({a: '123'}).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.Object.hashValue().should.be.above(-1);
    });

    it('should hash an empty object', function () {
      T.Object.hashValue({}).should.be.above(-1);
    });

  });
});
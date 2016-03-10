describeRealm('Builtin: Any', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Any.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      (T.Any() === null).should.equal(true);
    });

    it('should cast a number', function () {
      T.Any(258).should.equal(258);
    });

    it('should cast a string', function () {
      T.Any("123").should.equal("123");
    });

    it('should cast an empty string', function () {
      T.Any("").should.equal("");
    });
  });

  it('should not create a new instance', function () {
    (() => new T.Any(true)).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      (T.Any.emptyValue() === null).should.equal(true);
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.Any.randomValue();
      (value === null).should.equal(true);
    });

    it('should accept a random value', function () {
      T.Any.accepts(T.Any.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .clear()', function () {
    let SimpleStruct;
    let struct;
    before(() => {
      SimpleStruct = new realm.StructType({a: T.Float64, b: T.Float64, c: T.Float64});
    })
    it('should initialize an address', function () {
      T.Any.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      (T.Any.load(backing, address) === null).should.equal(true);
    });

    it('should store a boolean true value at an address', function () {
      T.Any.store(backing, address, true);
    });

    it('should load a boolean true value from an address', function () {
      T.Any.load(backing, address).should.equal(true);
    });

    it('should store a boolean false value at an address', function () {
      T.Any.store(backing, address, false);
    });

    it('should load a boolean false value from an address', function () {
      T.Any.load(backing, address).should.equal(false);
    });

    it('should store a numeric value at an address', function () {
      T.Any.store(backing, address, 12345.6);
    });

    it('should load a numeric value from an address', function () {
      T.Any.load(backing, address).should.equal(12345.6);
    });

    it('should store a string value at an address', function () {
       T.Any.store(backing, address, 'hello world');
    });

    it('should load a string value from an address', function () {
      T.Any.load(backing, address).should.equal('hello world');
    });

    it('should store a typed object at an address', function () {
      struct = new SimpleStruct({a: 1, b: 2, c: 3});
      T.Any.store(backing, address, struct);
    });

    it('should load a typed object from an address', function () {
      T.Any.load(backing, address).toJSON().should.eql({a: 1, b: 2, c: 3});
    });

    it('should exactly equal the value', function () {
      SimpleStruct.equal(struct, T.Any.load(backing, address)).should.equal(true);
    });

    it('should store a vanilla object value at an address', function () {
       T.Any.store(backing, address, {a: 1, b: 2, c: 3});
    });

    it('should load a vanilla object value from an address', function () {
      T.Any.load(backing, address).should.eql({a: 1, b: 2, c: 3});
    });


    it('should clear a value from an address', function () {
      T.Any.clear(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.Any.load(backing, address) === null).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.Any.hashValue(123).should.be.above(-1);
    });

    it('should hash a true value', function () {
      T.Any.hashValue(true).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.Any.hashValue(T.Any.emptyValue()).should.be.above(-1);
    });

  });
});
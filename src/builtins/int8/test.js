describeRealm('Builtin: Int8', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Int8.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      T.Int8().should.equal(0);
    });
    it('should cast an out of range number', function () {
      T.Int8(130).should.equal(-126);
    });

    it('should cast a stringly typed number', function () {
      T.Int8("123").should.equal(123);
    });

    it('should cast a non-numeric string', function () {
      T.Int8("hello world").should.equal(0);
    });
  });

  it('should not create a new instance', function () {
    (() => new T.Int8(123)).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      T.Int8.emptyValue().should.equal(0);
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.Int8.randomValue();
      (typeof value).should.equal('number');
    });

    it('should accept a random value', function () {
      T.Int8.accepts(T.Int8.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .clear()', function () {
    let input;
    before(() => {
      input = T.Int8.randomValue();
    });

    it('should initialize an address', function () {
      T.Int8.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      T.Int8.load(backing, address).should.equal(T.Int8.emptyValue());
    });

    it('should store a value at an address', function () {
       T.Int8.store(backing, address, input);
    });

    it('should load a value from an address', function () {
      T.Int8.load(backing, address).should.equal(input);
    });

    it('should clear a value from an address', function () {
      T.Int8.clear(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.Int8.load(backing, address) === T.Int8.emptyValue()).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.Int8.hashValue(123).should.be.above(-1);
    });

    it('should hash a random value', function () {
      T.Int8.hashValue(T.Int8.randomValue()).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.Int8.hashValue(T.Int8.emptyValue()).should.be.above(-1);
    });

  });
});
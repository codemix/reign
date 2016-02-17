describeRealm('Builtin: Int16', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Int16.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      T.Int16().should.equal(0);
    });
    it('should cast an out of range number', function () {
      T.Int16(32769).should.equal(-32767);
    });

    it('should cast a stringly typed number', function () {
      T.Int16("123").should.equal(123);
    });

    it('should cast a non-numeric string', function () {
      T.Int16("hello world").should.equal(0);
    });
  });

  it('should not create a new instance', function () {
    (() => new T.Int16(123)).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      T.Int16.emptyValue().should.equal(0);
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.Int16.randomValue();
      (typeof value).should.equal('number');
    });

    it('should accept a random value', function () {
      T.Int16.accepts(T.Int16.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .cleanup()', function () {
    let input;
    before(() => {
      input = T.Int16.randomValue();
    });

    it('should initialize an address', function () {
      T.Int16.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      T.Int16.load(backing, address).should.equal(T.Int16.emptyValue());
    });

    it('should store a value at an address', function () {
       T.Int16.store(backing, address, input);
    });

    it('should load a value from an address', function () {
      T.Int16.load(backing, address).should.equal(input);
    });

    it('should clean up a value from an address', function () {
      T.Int16.cleanup(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.Int16.load(backing, address) === T.Int16.emptyValue()).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.Int16.hashValue(123).should.be.above(0);
    });

    it('should hash an empty value', function () {
      T.Int16.hashValue(T.Int16.emptyValue()).should.be.above(0);
    });

  });

});
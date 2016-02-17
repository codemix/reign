describeRealm('Builtin: Uint32', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Uint32.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      T.Uint32().should.equal(0);
    });
    it('should cast an out of range number', function () {
      T.Uint32(4294967298).should.equal(2);
    });

    it('should cast a stringly typed number', function () {
      T.Uint32("123").should.equal(123);
    });

    it('should cast a non-numeric string', function () {
      T.Uint32("hello world").should.equal(0);
    });
  });

  it('should not create a new instance', function () {
    (() => new T.Uint32(123)).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      T.Uint32.emptyValue().should.equal(0);
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.Uint32.randomValue();
      (typeof value).should.equal('number');
    });

    it('should accept a random value', function () {
      T.Uint32.accepts(T.Uint32.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .cleanup()', function () {
    let input;
    before(() => {
      input = T.Uint32.randomValue();
    });

    it('should initialize an address', function () {
      T.Uint32.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      T.Uint32.load(backing, address).should.equal(T.Uint32.emptyValue());
    });

    it('should store a value at an address', function () {
       T.Uint32.store(backing, address, input);
    });

    it('should load a value from an address', function () {
      T.Uint32.load(backing, address).should.equal(input);
    });

    it('should clean up a value from an address', function () {
      T.Uint32.cleanup(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.Uint32.load(backing, address) === T.Uint32.emptyValue()).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.Uint32.hashValue(123).should.be.above(-1);
    });

    it('should hash a random value', function () {
      T.Uint32.hashValue(T.Uint32.randomValue()).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.Uint32.hashValue(T.Uint32.emptyValue()).should.be.above(-1);
    });

  });
});
describeRealm('Builtin: Float32', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Float32.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      T.Float32().should.equal(0);
    });
    it('should cast an out of range number', function () {
      T.Float32(1231231.12312543534533).should.equal(1231231.125);
    });

    it('should cast a stringly typed number', function () {
      T.Float32("16.5").should.equal(16.5);
    });

    it('should cast a non-numeric string', function () {
      T.Float32("hello world").should.equal(0);
    });
  });

  it('should not create a new instance', function () {
    (() => new T.Float32(123)).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      T.Float32.emptyValue().should.equal(0);
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.Float32.randomValue();
      (typeof value).should.equal('number');
    });

    it('should accept a random value', function () {
      T.Float32.accepts(T.Float32.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .cleanup()', function () {
    let input;
    before(() => {
      input = T.Float32.randomValue();
    });

    it('should initialize an address', function () {
      T.Float32.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      T.Float32.load(backing, address).should.equal(T.Float32.emptyValue());
    });

    it('should store a value at an address', function () {
       T.Float32.store(backing, address, input);
    });

    it('should load a value from an address', function () {
      T.Float32.load(backing, address).should.equal(input);
    });

    it('should clean up a value from an address', function () {
      T.Float32.cleanup(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.Float32.load(backing, address) === T.Float32.emptyValue()).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.Float32.hashValue(123).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.Float32.hashValue(T.Float32.emptyValue()).should.be.above(-1);
    });

  });

});
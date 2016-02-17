describeRealm('Builtin: Boolean', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Boolean.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      T.Boolean().should.equal(false);
    });

    it('should cast a number', function () {
      T.Boolean(258).should.equal(true);
    });

    it('should cast a string', function () {
      T.Boolean("123").should.equal(true);
    });

    it('should cast an empty string', function () {
      T.Boolean("").should.equal(false);
    });
  });

  it('should not create a new instance', function () {
    (() => new T.Boolean(true)).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      T.Boolean.emptyValue().should.equal(false);
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.Boolean.randomValue();
      (typeof value).should.equal('boolean');
    });

    it('should accept a random value', function () {
      T.Boolean.accepts(T.Boolean.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .cleanup()', function () {
    let input;
    before(() => {
      input = true;
    });

    it('should initialize an address', function () {
      T.Boolean.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      T.Boolean.load(backing, address).should.equal(false);
    });

    it('should store a value at an address', function () {
       T.Boolean.store(backing, address, input);
    });

    it('should load a value from an address', function () {
      T.Boolean.load(backing, address).should.equal(input);
    });

    it('should clean up a value from an address', function () {
      T.Boolean.cleanup(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.Boolean.load(backing, address) === false).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.Boolean.hashValue(123).should.be.above(-1);
    });

    it('should hash a true value', function () {
      T.Boolean.hashValue(true).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.Boolean.hashValue(T.Boolean.emptyValue()).should.be.above(-1);
    });

  });
});
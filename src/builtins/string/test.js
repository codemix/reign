describeRealm('Builtin: String', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.String.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      T.String().should.equal('');
    });

  });

  it('should not create a new instance', function () {
    (() => new T.String('wat')).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      T.String.emptyValue().should.equal('');
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.String.randomValue();
      (typeof value).should.equal('string');
    });

    it('should accept a random value', function () {
      T.String.accepts(T.String.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .clear()', function () {
    let input;
    before(() => {
      input = T.String.randomValue();
    });

    it('should initialize an address', function () {
      T.String.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      T.String.load(backing, address).should.equal(T.String.emptyValue());
    });

    it('should store a value at an address', function () {
      T.String.store(backing, address, input);
    });

    it('should load a value from an address', function () {
      T.String.load(backing, address).should.equal(input);
    });

    it('should clear a value from an address', function () {
      T.String.clear(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.String.load(backing, address) === T.String.emptyValue()).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.String.hashValue(123).should.be.above(-1);
    });

    it('should hash a random value', function () {
      T.String.hashValue(T.String.randomValue()).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.String.hashValue(T.String.emptyValue()).should.be.above(-1);
    });

  });
});
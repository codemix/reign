describeRealm('Builtin: InternedString', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.InternedString.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Cast', function () {
    it('should return an empty value for empty input', function () {
      T.InternedString().should.equal('');
    });

  });

  it('should not create a new instance', function () {
    (() => new T.InternedString('wat')).should.throw(TypeError);
  });

  describe('.emptyValue()', function () {
    it('should return an empty value', function () {
      T.InternedString.emptyValue().should.equal('');
    });
  });

  describe('.randomValue()', function () {
    it('should return a random value', function () {
      const value = T.InternedString.randomValue();
      (typeof value).should.equal('string');
    });

    it('should accept a random value', function () {
      T.InternedString.accepts(T.InternedString.randomValue()).should.equal(true);
    });
  });

  describe('.initialize(), .store(), .load() and .clear()', function () {
    let input;
    before(() => {
      input = T.InternedString.randomValue();
    });

    it('should initialize an address', function () {
      T.InternedString.initialize(backing, address);
    });

    it('should load an empty value from a just-initialized address', function () {
      T.InternedString.load(backing, address).should.equal(T.InternedString.emptyValue());
    });

    it('should store a value at an address', function () {
      T.InternedString.store(backing, address, input);
    });

    it('should load a value from an address', function () {
      T.InternedString.load(backing, address).should.equal(input);
    });

    it('should clear a value from an address', function () {
      T.InternedString.clear(backing, address);
    });

    it('should load an empty value from a cleaned up address', function () {
      (T.InternedString.load(backing, address) === T.InternedString.emptyValue()).should.equal(true);
    });
  });

  describe('.hashValue()', function () {
    it('should hash a value', function () {
      T.InternedString.hashValue('abc').should.be.above(-1);
    });

    it('should hash a random value', function () {
      T.InternedString.hashValue(T.InternedString.randomValue()).should.be.above(-1);
    });

    it('should hash an empty value', function () {
      T.InternedString.hashValue(T.InternedString.emptyValue()).should.be.above(-1);
    });
  });

  describe('.Array', function () {
    let array;
    it('should create an array of items', function () {
      array = new T.InternedString.Array(4);
    });

    it('should have the right length', function () {
      array.length.should.equal(4);
    });

    it('every entry should be empty', function () {
      for (let i = 0; i < array.length; i++) {
        array[i].should.equal('');
      }
    });

    it('should set an item in the middle of the array', function () {
      array[2] = 'hello world';
    });

    it('should have stored the item', function () {
      array[2].should.equal('hello world');
    });

    it('should overwrite the item', function () {
      array[2] = 'wat';
    });

    it('should have overwritten the item', function () {
      array[2].should.equal('wat');
    });

    it('should set every item in the array', function () {
      array[0] = 'a';
      array[1] = 'b';
      array[2] = 'c';
      array[3] = 'd';
    });

    it('should have set every item in the array', function () {
      array[0].should.equal('a');
      array[1].should.equal('b');
      array[2].should.equal('c');
      array[3].should.equal('d');
    });

    it('should clear every item in the array', function () {
      array[0] = '';
      array[1] = '';
      array[2] = '';
      array[3] = '';
    });

    it('should have cleared every item in the array', function () {
      array[0].should.equal('');
      array[1].should.equal('');
      array[2].should.equal('');
      array[3].should.equal('');
    });

    it('should create an array of items from a list of strings', function () {
      array = new T.InternedString.Array([
        'foo',
        'bar',
        'qux',
        'foobar',
        'hello',
        'world'
      ]);
    });

    it('should have the right length', function () {
      array.length.should.equal(6);
    });

    it('should have set the contents', function () {
      array[0].should.equal('foo');
      array[1].should.equal('bar');
      array[2].should.equal('qux');
      array[3].should.equal('foobar');
      array[4].should.equal('hello');
      array[5].should.equal('world');
    });
  });
});
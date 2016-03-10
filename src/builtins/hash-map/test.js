describeRealm('Builtin: HashMap', function (options) {
  let realm;
  let backing;
  let T;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
  });

  describe('Empty hash map', function () {
    let map;
    it('should create a new hash map', function () {
      map = new T.HashMap();
    });

    it('should have a size of zero', function () {
      map.size.should.equal(0);
    });

    it('should set a string key + value', function () {
      map.set('hello', 'world');
    });

    it('should get a string key + value', function () {
      map.get('hello').should.equal('world');
    });

    it('should set a numeric key', function () {
      map.set(123, 'abc');
    });

    it('should get a numeric key', function () {
      map.get(123).should.equal('abc');
    });

    it('should set a boolean key / value', function () {
      map.set(true, false);
    });

    it('should get a boolean key', function () {
      map.get(true).should.equal(false);
    });

    it('should have the right size', function () {
      map.size.should.equal(3);
    });
  });

  describe('Hashmap from map', function () {
    let map;

    it('should create a new hash map', function () {
      map = new T.HashMap(new Map([['hello', 'world']]));
    });

    it('should have a size of 1', function () {
      map.size.should.equal(1);
    });

    it('should get a string key + value', function () {
      map.get('hello').should.equal('world');
    });

    it('should set a numeric key', function () {
      map.set(123, 'abc');
    });

    it('should get a numeric key', function () {
      map.get(123).should.equal('abc');
    });

    it('should set a boolean key / value', function () {
      map.set(true, false);
    });

    it('should get a boolean key', function () {
      map.get(true).should.equal(false);
    });

    it('should have the right size', function () {
      map.size.should.equal(3);
    });
  });
});
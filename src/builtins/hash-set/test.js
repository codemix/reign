describeRealm('Builtin: HashSet', function (options) {
  let realm;
  let backing;
  let T;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
  });

  describe('Empty hash set', function () {
    let set;
    it('should create a new hash set', function () {
      set = new T.HashSet();
    });

    it('should have a size of zero', function () {
      set.size.should.equal(0);
    });

    it('should set a string key + value', function () {
      set.add('hello');
    });

    it('should have a string key + value', function () {
      set.has('hello').should.equal(true);
    });

    it('should add a numeric key', function () {
      set.add(123);
    });

    it('should have a numeric key', function () {
      set.has(123).should.equal(true);
    });

    it('should add a boolean key', function () {
      set.add(true);
    });

    it('should have a boolean key', function () {
      set.has(true).should.equal(true);
    });

    it('should have the right size', function () {
      set.size.should.equal(3);
    });
  });

  describe('HashSet from set', function () {
    let set;

    it('should create a new hash set', function () {
      set = new T.HashSet(new Set(['hello']));
    });

    it('should have a size of 1', function () {
      set.size.should.equal(1);
    });

    it('should have a string key', function () {
      set.has('hello').should.equal(true);
    });

    it('should add a numeric key', function () {
      set.add(123);
    });

    it('should have a numeric key', function () {
      set.has(123).should.equal(true);
    });

    it('should add a boolean key', function () {
      set.add(true);
    });

    it('should have a boolean key', function () {
      set.has(true).should.equal(true);
    });

    it('should have the right size', function () {
      set.size.should.equal(3);
    });
  });
});
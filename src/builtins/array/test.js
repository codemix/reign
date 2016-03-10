describeRealm('Builtin: Array', function (options) {
  let realm;
  let backing;
  let T;
  let address;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    address = backing.alloc(T.Array.byteLength);
  });

  after(() => {
    backing.free(address);
  });

  describe('Array from length', function () {
    let arr;

    it('should create a new array', function () {
      arr = new T.Array(3);
    });

    it('should have the right length', function () {
      arr.length.should.equal(3);
    });

    it('should be full of nulls', function () {
      arr.toJSON().should.eql([null, null, null])
    });

    it('should set some values', function () {
      arr[0] = 'abc';
      arr[1] = true;
      arr[2] = {
        greeting: 'hello world'
      };
    });

    it('should get some values', function () {
      arr[0].should.equal('abc')
      arr[1].should.equal(true);
      arr[2].should.eql({
        greeting: 'hello world'
      });
    });

    it('should overwrite some values', function () {
      arr[1] = false;
    });

    it('should get some values again', function () {
      arr[0].should.equal('abc')
      arr[1].should.equal(false);
      arr[2].should.eql({
        greeting: 'hello world'
      });
    });
  });


  describe('Array from input', function () {
    let arr;

    it('should create a new array', function () {
      arr = new T.Array(['abc', true, {greeting: 'hello world'}]);
    });

    it('should have the right length', function () {
      arr.length.should.equal(3);
    });

    it('should get some values', function () {
      arr[0].should.equal('abc')
      arr[1].should.equal(true);
      arr[2].should.eql({
        greeting: 'hello world'
      });
    });

    it('should overwrite some values', function () {
      arr[1] = false;
    });

    it('should get some values again', function () {
      arr[0].should.equal('abc')
      arr[1].should.equal(false);
      arr[2].should.eql({
        greeting: 'hello world'
      });
    });
  });

  describe('Multidimensional array', function () {
    let arr;
    it('should create a new array', function () {
      arr = new T.Array.Array([
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3]
      ]);
    });

    it('should have the right length', function () {
      arr.length.should.equal(3);
      arr[0].length.should.equal(3);
      arr[1].length.should.equal(3);
      arr[2].length.should.equal(3);
    });
  });

});
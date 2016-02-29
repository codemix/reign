import {$StringPool} from '../symbols';
describeRealm('StringPool', function (options) {
  let realm;
  let pool;
  let backing;
  let T;

  before(() => {
    realm = options.realm;
    backing = realm.backing;
    T = realm.T;
    pool = realm[$StringPool];
  });


  describe('Store multiple entries', function () {
    const length = 1024;
    let input;
    let addresses;
    before(() => {
      input = Array.from({length}, (_, index) => `string ${index}.`);
    });

    it(`should store ${length} unique strings`, function () {
      addresses = input.map(item => pool.add(item));
    });

    it('should have set the reference count to 1 for all the addresses', function () {
      addresses.forEach(address => {
        backing.gc.refCount(address).should.equal(1);
      });
    });

    it('should store the same strings again, returning the same addresses', function () {
      input.map(item => pool.add(item)).forEach((address, index) => {
        address.should.equal(addresses[index]);
      });
    });

    it('should have set the reference count to 2 for all the addresses', function () {
      addresses.forEach(address => {
        backing.gc.refCount(address).should.equal(2);
      });
    });

    it('should have the right length', function () {
      addresses.length.should.equal(length);
    });

    it(`should have stored ${length} strings`, function () {
      input.forEach(item => {
        pool.has(item).should.equal(true);
      });
    });

    it('should get the address for each item', function () {
      input.forEach((item, index) => {
        pool.get(item).should.equal(addresses[index]);
      });
    });
  });

  describe('Benchmarks', function () {
    const length = 1024;
    let asciiInput, multiInput;
    let addresses;
    before(() => {
      asciiInput = Array.from({length}, (_, index) => `string ${index}.`);
      asciiInput.forEach(item => pool.add(item));
      multiInput = Array.from({length}, (_, index) => `☃☃☃☃☃☃ ${index}.`);
      multiInput.forEach(item => pool.add(item));
    });



    benchmark('Add strings', 100000, {
      ascii (index) {
        return pool.add(`Test ${index % 50000}`);
      },
      multibyte (index) {
        return pool.add(`☃☃☃☃ ${index % 50000}`)
      }
    });

    benchmark('Remove strings', 100000, {
      ascii (index) {
        return pool.remove(`Test ${index % 50000}`);
      },
      multibyte (index) {
        return pool.remove(`☃☃☃☃ ${index % 50000}`)
      }
    });


    benchmark('Add pre-existing strings', 100000, {
      ascii (index) {
        return pool.add(asciiInput[index % length]);
      },
      multibyte (index) {
        return pool.add(multiInput[index % length]);
      }
    });

  });

});
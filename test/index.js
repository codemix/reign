import Backing from "backing";
import {Realm} from "../src";

describeBacking('TypeRealm', function (options) {
  let backing;
  let realm;
  let T;
  before(() => {
    backing = options.backing;
  });

  describe('.constructor()', function () {
    it('should create a new realm', function () {
      realm = new Realm(backing);
      realm.isInitialized.should.equal(false);
    });
  });

  describe('.init()', function () {
    it('should initialize the realm', async function () {
      await realm.init();
      realm.isInitialized.should.equal(true);
      T = realm.T;
    });

    it('should not initialize the realm twice', async function () {
      let threw = false;
      try {
        await realm.init();
      }
      catch (e) {
        threw = true;
      }
      threw.should.equal(true);
    });
  });

  describe('Uint8', function () {
    it('should cast a value to uint8', function () {
      T.Uint8("123").should.equal(123);
    });

    it('should not create an instance of a primitive type', function () {
      (() => new T.Uint8(123)).should.throw(TypeError);
    });
  });

});
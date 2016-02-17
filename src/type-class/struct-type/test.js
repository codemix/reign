import {Realm} from "../..";
import {Struct} from "./";

describe.skip('StructType', function () {
  let realm;
  let StructType;
  let User;
  let T;
  let instance;

  before(() => {
    realm = new Realm();
    T = realm.types;
    StructType = realm.StructType;
  });

  it('StructType should be an instance of realm.TypeClass', function () {
    StructType.should.be.an.instanceOf(realm.TypeClass);
  });

  it('should create a new struct type', function () {
    User = new StructType('User', {
      name: T.String,
      aliases: T.String.vector(),
      age: T.Uint8,

    });
  });

  it('User should be an instance of StructType', function () {
    User.should.be.an.instanceOf(StructType);
  });

  it('should create an instance', function () {
    instance = new User(123.456);
  });

  it('instance should be an instance of User', function () {
    instance.should.be.an.instanceOf(User);
  });

  it('instance should be an instance of Struct', function () {
    instance.should.be.an.instanceOf(Struct);
  });

  it('should coerce the instance to a value', function () {
    (instance > 122).should.equal(true);
    (instance > 124).should.equal(false);
  });

  it('should convert the value to and from JSON', function () {
    JSON.parse(JSON.stringify(instance)).should.equal(instance.valueOf());
  });
});
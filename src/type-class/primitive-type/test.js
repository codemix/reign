import {Realm} from "../..";
import {Primitive} from "./";

describeRealm('PrimitiveType', function (options) {
  let realm;
  let PrimitiveType;
  let Double;
  let instance;

  before(() => {
    realm = options.realm;
    PrimitiveType = realm.PrimitiveType;
  });

  it('PrimitiveType should be an instance of realm.TypeClass', function () {
    PrimitiveType.should.be.an.instanceOf(realm.TypeClass);
  });

  it('should create a new primitive type', function () {
    Double = new PrimitiveType('Double', {
      byteAlignment: 8,
      byteLength: 8,
      store (backing: Backing, address: float64, value: number): void {
        backing.writeFloat64(address, value);
      },
      load (backing: Backing, address: float64): number {
        return backing.readFloat64(backing, address);
      }
    });
  });

  it('Double should be an instance of PrimitiveType', function () {
    Double.should.be.an.instanceOf(PrimitiveType);
  });

  it('should cast a value', function () {
    instance = Double(123.456);
  });
});
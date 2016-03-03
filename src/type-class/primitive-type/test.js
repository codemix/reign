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
    Double = new PrimitiveType({
      byteAlignment: 8,
      byteLength: 8,
      emptyValue () {
        return 0;
      },
      store (backing: Backing, address: float64, value: number): void {
        backing.setFloat64(address, value || 0);
      },
      load (backing: Backing, address: float64): number {
        return backing.getFloat64(address);
      }
    });
  });

  it('Double should be an instance of PrimitiveType', function () {
    Double.should.be.an.instanceOf(PrimitiveType);
  });

  it('should cast a value', function () {
    instance = Double(123.456);
  });

  it('should create an array type', function () {
    Double.Array.should.be.an.instanceOf(realm.ArrayType);
  });

  it('should get the same array type twice', function () {
    Double.Array.should.equal(Double.Array);
  });

  it('should create an array of 20 doubles', function () {
    const arr = new Double.Array(20);
    arr.length.should.equal(20);
    arr.forEach(item => {
      item.should.equal(0);
    });
  });
});
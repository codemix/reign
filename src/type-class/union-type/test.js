import {Realm} from "../..";
import {Struct} from "./";

import {$Backing, $Address} from "../../symbols";

describeRealm('UnionType', function (options) {
  let realm;
  let StructType;
  let UnionType;
  let T;
  let Point;
  let StringOrPoint;
  let instance;

  before(() => {
    realm = options.realm;
    StructType = realm.StructType;
    UnionType = realm.UnionType;
    T = realm.T;
  });

  it('should create some struct types', function () {
    Point = new StructType({
      x: T.Float64,
      y: T.Float64
    }, {
      name: 'Point'
    });
  });

  it('should create a StringOrPoint union type', function () {
    StringOrPoint = new UnionType(
      T.String,
      Point
    );
  });

  it('should have the right byte length', function () {
    StringOrPoint.byteLength.should.equal(24);
  });

  it('should create a boxed StringOrPoint instance', function () {
    instance = new StringOrPoint({x: 123, y: 456});
  });

  it('instance.value should be an instance of Point', function () {
    instance.value.should.be.an.instanceOf(Point);
  });

  it('instance.value should have the right properties', function () {
    instance.value.x.should.equal(123);
    instance.value.y.should.equal(456);
  });

  it('should overwrite the value with a different type', function () {
    instance.value = "hello world";
  });

  it('should have overwritten the value', function () {
    instance.value.should.equal("hello world");
  });

  it('should overwrite the value with the same type', function () {
    instance.value = "foo bar";
  });

  it('should have updated the value', function () {
    instance.value.should.equal("foo bar");
    console.log(instance);
    dump(instance);
    jdump(instance);
  });

});
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

  describe('Boxed', function () {
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
    });

    it('should write a null value', function () {
      instance.value = null;
    });

    it('should read a null value', function () {
      (instance.value == null).should.equal(true);
    });
  });

  describe('UnionArray', function () {
    let arr;
    it('should create a StringOrPoint.Array instance', function () {
      arr = new StringOrPoint.Array(3);
    });

    it('should have a length of 3', function () {
      arr.length.should.equal(3);
    });

    it('should be full of nulls', function () {
      arr.forEach(item => (item === null).should.equal(true));
    });

    it('should write some values', function () {
      arr[0] = "foo";
      arr[1] = {x: 1, y: 2};
      arr[2] = "bar";
    });

    it('should have the right values', function () {
      arr[0].should.equal("foo");
      arr[1].toJSON().should.eql({x: 1, y: 2});
      arr[2].should.equal("bar");
    });

    it('should overwrite a value', function () {
      arr[1] = "baz";
    });

    it('should have overwritten the value', function () {
      arr.toJSON().should.eql(["foo", "baz", "bar"]);
    });
  });

  describe('Union in a struct', function () {
    let SimpleStruct;
    let struct;
    it('should create a struct type', function () {
      SimpleStruct = new StructType({
        name: T.String,
        age: T.Uint8,
        pointOrAddress: StringOrPoint
      });
    });

    it('should create a new instance', function () {
      struct = new SimpleStruct({
        name: 'Bob',
        age: 99,
        pointOrAddress: '123 Fake Street'
      });
    });

    it('should have the right values', function () {
      struct.toJSON().should.eql({
        name: 'Bob',
        age: 99,
        pointOrAddress: '123 Fake Street'
      });
    });

    it('should overwrite a value', function () {
      struct.pointOrAddress = {
        x: 2,
        y: 4
      };
    });

    it('should have the right type', function () {
      struct.pointOrAddress.should.be.an.instanceOf(Point);
    });

    it('should have the right values', function () {
      struct.pointOrAddress.x.should.equal(2);
      struct.pointOrAddress.y.should.equal(4);
    });

    it('should overwite a point value', function () {
      struct.pointOrAddress.y = 123;
    });

    it('should have the right values', function () {
      struct.pointOrAddress.toJSON().should.eql({
        x: 2,
        y: 123
      });
    });

    it('should overwrite again, this time with null', function () {
      struct.pointOrAddress = null;
    });

    it('should have the right value', function () {
      (struct.pointOrAddress === null).should.equal(true);
    });

  });

  describe('.randomValue()', function () {
    it('should create a random value', function () {
      const value = StringOrPoint.randomValue();
      (typeof value === 'string' || value instanceof Point).should.equal(true);
    });
  });

});
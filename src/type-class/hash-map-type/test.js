import {Realm} from "../..";

import {$Backing, $Address} from "../../symbols";

describeRealm('HashMapType', function (options) {
  let realm;
  let HashMapType;
  let StructType;
  let SimpleMap;
  let instance;
  let T;

  before(() => {
    realm = options.realm;
    T = realm.T;
    HashMapType = realm.HashMapType;
    StructType = realm.StructType;
  });

  it('HashMapType should be an instance of realm.TypeClass', function () {
    HashMapType.should.be.an.instanceOf(realm.TypeClass);
  });

  it('should create a simple hash map type', function () {
    SimpleMap = new HashMapType(T.Uint32, T.Uint32);
  });

  it('SimpleMap should be an instance of HashMapType', function () {
    SimpleMap.should.be.an.instanceOf(HashMapType);
  });

  it('should create a new, empty instance', function () {
    instance = new SimpleMap();
  });

  it('should have a size of 0', function () {
    instance.size.should.equal(0);
  });

  it('should not have the value', function () {
    instance.has(123).should.equal(false);
  });

  it('should add an item to the map', function () {
    instance.set(123, 456);
  });

  it('should have a size of 1', function () {
    instance.size.should.equal(1);
  });

  it('should have the value', function () {
    instance.has(123).should.equal(true);
  });

  it('should get the value', function () {
    instance.get(123).should.equal(456);
  });

  it('should create a new instance from an array', function () {
    instance = new SimpleMap([
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6]
    ]);
  });

  it('should have the right size', function () {
    instance.size.should.equal(5);
  });

  it('should have all the keys', function () {
    instance.has(1).should.equal(true);
    instance.has(2).should.equal(true);
    instance.has(3).should.equal(true);
    instance.has(4).should.equal(true);
    instance.has(5).should.equal(true);
    instance.has(6).should.equal(false);
  });

  it('should get all the keys', function () {
    instance.get(1).should.equal(2);
    instance.get(2).should.equal(3);
    instance.get(3).should.equal(4);
    instance.get(4).should.equal(5);
    instance.get(5).should.equal(6);
    (instance.get(6) === undefined).should.equal(true);
  });

  it('should create a new instance from a native Map', function () {
    instance = new SimpleMap(new Map([
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6]
    ]));
  });

  it('should have the right size', function () {
    instance.size.should.equal(5);
  });

  it('should have all the keys', function () {
    instance.has(1).should.equal(true);
    instance.has(2).should.equal(true);
    instance.has(3).should.equal(true);
    instance.has(4).should.equal(true);
    instance.has(5).should.equal(true);
    instance.has(6).should.equal(false);
  });

  it('should get all the keys', function () {
    instance.get(1).should.equal(2);
    instance.get(2).should.equal(3);
    instance.get(3).should.equal(4);
    instance.get(4).should.equal(5);
    instance.get(5).should.equal(6);
    (instance.get(6) === undefined).should.equal(true);
  });

  it('should create a new instance from an object', function () {
    instance = new SimpleMap({
      1: 2,
      2: 3,
      3: 4,
      4: 5,
      5: 6
    });
  });

  it('should have the right size', function () {
    instance.size.should.equal(5);
  });

  it('should have all the keys', function () {
    instance.has(1).should.equal(true);
    instance.has(2).should.equal(true);
    instance.has(3).should.equal(true);
    instance.has(4).should.equal(true);
    instance.has(5).should.equal(true);
    instance.has(6).should.equal(false);
  });

  it('should get all the keys', function () {
    instance.get(1).should.equal(2);
    instance.get(2).should.equal(3);
    instance.get(3).should.equal(4);
    instance.get(4).should.equal(5);
    instance.get(5).should.equal(6);
    (instance.get(6) === undefined).should.equal(true);
  });

});
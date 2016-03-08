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

   describe('HashMap<String, String>', function () {
    let HashMap;
    it('should make a new hash map', function () {
      HashMap = new HashMapType(T.String, T.String);
    });

    it('should have the right name', function () {
      HashMap.name.should.equal('HashMap<String, String>')
    });

    describe('Empty instance', function () {
      let instance;
      it('should create a new instance', function () {
        instance = new HashMap();
      });

      it('should have an initial size of 0', function () {
        instance.size.should.equal(0);
      });

      it('should add an item', function () {
        instance.set("hello", "world");
      });

      it('should have the added item', function () {
        instance.has("hello").should.equal(true);
      });

      it('should get the added item', function () {
        instance.get("hello").should.equal("world");
      });

      it('should not have any other items', function () {
        instance.has("nope").should.equal(false);
      });

      it('should add another item', function () {
        instance.set("foo", "bar");
      });

      it('should have the added item', function () {
        instance.has("foo").should.equal(true);
      });

      it('should get the added item', function () {
        instance.get("foo").should.equal("bar");
      });
    });

    const inputs = {
      'instance from array': [["hello", "world"], ["foo", "bar"]],
      'instance from Map': new Map([["hello", "world"], ["foo", "bar"]]),
      'instance from Object': {
        hello: "world",
        foo: "bar"
      }
    };
    Object.keys(inputs).forEach(testName => {
      const input = inputs[testName];
      describe(testName, function () {
        let instance;
        it('should create a new instance', function () {
          instance = new HashMap(input);
        });

        it('should set the right size', function () {
          instance.size.should.equal(2);
        });

        it('should have the first item', function () {
          instance.has("hello").should.equal(true);
        });

        it('should get the first item', function () {
          instance.get("hello").should.equal("world");
        });

        it('should have the second item', function () {
          instance.has("foo").should.equal(true);
        });

        it('should get the second item', function () {
          instance.get("foo").should.equal("bar");
        });

        it('should overwrite the first item', function () {
          instance.set("hello", "World!");
        });

        it('should not have incremented the size', function () {
          instance.size.should.equal(2);
        });

        it('should add a new item', function () {
          instance.set("qux", "xuq");
        });

        it('should have incremented the size', function () {
          instance.size.should.equal(3);
        });

        it('should have all the entries', function () {
          instance.has("hello").should.equal(true);
          instance.has("foo").should.equal(true);
          instance.has("qux").should.equal(true);
        });

        it('should get all the entries', function () {
          instance.get("hello").should.equal("World!");
          instance.get("foo").should.equal("bar");
          instance.get("qux").should.equal("xuq");
        });

        it('should delete the first entry', function () {
          instance.delete("hello").should.equal(true);
          instance.delete("hello").should.equal(false);
        });

        it('should delete the second entry', function () {
          instance.delete("foo").should.equal(true);
          instance.delete("foo").should.equal(false);
        });

        it('should delete the third entry', function () {
          instance.delete("qux").should.equal(true);
          instance.delete("qux").should.equal(false);
        });

        it('should have reset the size to zero', function () {
          instance.size.should.equal(0);
        });
      });
    });
  });

  PRIMITIVE_NAMES.forEach((keyTypeName, typeIndex) => {
    const valueTypeName = PRIMITIVE_NAMES[(typeIndex + 1) % PRIMITIVE_NAMES.length];

    let HashMap;
    let KeyType;
    let ValueType;

    before(() => {
      KeyType = T[keyTypeName];
      ValueType = T[valueTypeName];
    });

    describe(`HashMap<${keyTypeName}, ${valueTypeName}>`, function () {
      let instance;
      let key;
      let otherKey;
      let value;

      before(() => {
        HashMap = new HashMapType(KeyType, ValueType);
        key = KeyType.randomValue();
        otherKey = KeyType.randomValue();
        // avoid cases where we generate duplicate keys
        let count = 0;
        while (key === otherKey && count < 100) {
          count++;
          otherKey = KeyType.randomValue();
        }
        if (key === otherKey) {
          throw new Error('Could not generate another key for ' + keyTypeName);
        }

        value = ValueType.randomValue();
      });

      it('should set the right name', function () {
        HashMap.name.should.equal(`HashMap<${keyTypeName}, ${valueTypeName}>`);
      });

      it('should set the correct byte alignment', function () {
        HashMap.byteAlignment.should.equal(Math.max(8, KeyType.byteAlignment, ValueType.byteAlignment));
      });

      it('should create a random instance', function () {

        instance = HashMap.randomValue();
        HashMap.accepts(instance).should.equal(true);
        instance.size.should.be.above(0);

        let count = 0;
        for (let [key, value] of instance) {
          KeyType.accepts(key).should.equal(true);
          ValueType.accepts(value).should.equal(true);
          count++;
        }
        count.should.equal(instance.size);
      });

      it('should create a new hash map', function () {
        instance = new HashMap();
      });

      it('should have the right initial size', function () {
        instance.size.should.equal(0);
      });

      it('should add a value to the map', function () {
        instance.set(key, value);
      });

      it('should have the right size after adding 1 value', function () {
        instance.size.should.equal(1);
      });

      it('should get a value from the map', function () {
        (instance.get(key) === value).should.equal(true);
      });

      it('should not get a missing value from the map', function () {
        (instance.get(otherKey) === undefined).should.equal(true);
      });

      it('should have the given key', function () {
        instance.has(key).should.equal(true);
      });

      it('should not have the other key', function () {
        instance.has(otherKey).should.equal(false);
      });

      it('should add the other key', function () {
        instance.set(otherKey, value);
      });

      it('should have the right size after adding the other key', function () {
        instance.size.should.equal(2);
      });

      it('should have the other key', function () {
        instance.has(otherKey).should.equal(true);
      });

      it('should have the right value for the other key', function () {
        (instance.get(otherKey) === value).should.equal(true);
      });

      it('should remove the first key', function () {
        instance.delete(key).should.equal(true);
      });

      it('should have the right size', function () {
        instance.size.should.equal(1);
      });

      it('should not remove the first key twice', function () {
        instance.delete(key).should.equal(false);
      });

      it('should have the right size', function () {
        instance.size.should.equal(1);
      });

      it('should remove the second key', function () {
        instance.delete(otherKey).should.equal(true);
      });

      it('should have the right size after removing all keys', function () {
        instance.size.should.equal(0);
      });

    });
  });

  describe('Hashmap within a struct', function () {
    let Container;
    let StringMap;
    let container;
    before(() => {
      StringMap = new HashMapType(T.InternedString, T.String);
      Container = new StructType({
        name: T.String,
        dict: StringMap
      });
    });

    it('should create an empty container', function () {
      container = new Container();
    });

    it('should have an empty name', function () {
      container.name.should.equal('');
    });

    it('should set the name', function () {
      container.name = 'name goes here.';
    });

    it('should get the name', function () {
      container.name.should.equal('name goes here.');
    });

    it('should have an empty hash map', function () {
      container.dict.size.should.equal(0);
    });

    it('should add some items to the dictionary', function () {
      container.dict.set('hello', 'world');
      container.dict.set('foo', 'bar');
      container.dict.set('greetings', 'aliens');
    });

    it('should have the right size', function () {
      container.dict.size.should.equal(3);
    });

    it('should have the items', function () {
      container.dict.has('hello').should.equal(true);
      container.dict.has('foo').should.equal(true);
      container.dict.has('greetings').should.equal(true);
    });

    it('should get the items', function () {
      container.dict.get('hello').should.equal('world');
      container.dict.get('foo').should.equal('bar');
      container.dict.get('greetings').should.equal('aliens');
    });

    it('should perform a number of garbage collection cycles', function () {
      realm.backing.gc.cycle();
      realm.backing.gc.cycle();
      realm.backing.gc.cycle();
      realm.backing.gc.cycle();
      realm.backing.gc.cycle();
    });
  });
});
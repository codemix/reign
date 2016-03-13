import {Realm} from "../..";

import {$Backing, $Address} from "../../symbols";

describeRealm('HashSetType', function (options) {
  let realm;
  let HashSetType;
  let StructType;
  let SimpleSet;
  let instance;
  let T;

  before(() => {
    realm = options.realm;
    T = realm.T;
    HashSetType = realm.HashSetType;
    StructType = realm.StructType;
  });

  it('HashSetType should be an instance of realm.TypeClass', function () {
    HashSetType.should.be.an.instanceOf(realm.TypeClass);
  });

  it('should create a simple hash set type', function () {
    SimpleSet = new HashSetType(T.Uint32);
  });

  it('SimpleSet should be an instance of HashSetType', function () {
    SimpleSet.should.be.an.instanceOf(HashSetType);
  });

  it('should create a new, empty instance', function () {
    instance = new SimpleSet();
  });

  it('should have a size of 0', function () {
    instance.size.should.equal(0);
  });

  it('should not have the value', function () {
    instance.has(123).should.equal(false);
  });

  it('should add an item to the set', function () {
    instance.add(123);
  });

  it('should have a size of 1', function () {
    instance.size.should.equal(1);
  });

  it('should have the value', function () {
    instance.has(123).should.equal(true);
  });


  it('should create a new instance from an array', function () {
    instance = new SimpleSet([
      1,
      2,
      3,
      4,
      5
    ]);
  });

  it('should have the right size', function () {
    instance.size.should.equal(5);
  });

  it('should have all the entries', function () {
    instance.has(1).should.equal(true);
    instance.has(2).should.equal(true);
    instance.has(3).should.equal(true);
    instance.has(4).should.equal(true);
    instance.has(5).should.equal(true);
    instance.has(6).should.equal(false);
  });

  it('should create a new instance from a native Set', function () {
    instance = new SimpleSet(new Set([
      1,
      2,
      3,
      4,
      5
    ]));
  });

  it('should have the right size', function () {
    instance.size.should.equal(5);
  });

  it('should have all the entries', function () {
    instance.has(1).should.equal(true);
    instance.has(2).should.equal(true);
    instance.has(3).should.equal(true);
    instance.has(4).should.equal(true);
    instance.has(5).should.equal(true);
    instance.has(6).should.equal(false);
  });

   describe('HashSet<String>', function () {
    let HashSet;
    it('should make a new hash set', function () {
      HashSet = new HashSetType(T.String);
    });

    it('should have the right name', function () {
      HashSet.name.should.equal('HashSet<String>')
    });

    describe('Empty instance', function () {
      let instance;
      it('should create a new instance', function () {
        instance = new HashSet();
      });

      it('should have an initial size of 0', function () {
        instance.size.should.equal(0);
      });

      it('should add an item', function () {
        instance.add("hello");
      });

      it('should have the added item', function () {
        instance.has("hello").should.equal(true);
      });

      it('should not have any other items', function () {
        instance.has("nope").should.equal(false);
      });

      it('should add another item', function () {
        instance.add("foo");
      });

      it('should have the added item', function () {
        instance.has("foo").should.equal(true);
      });

    });

    const inputs = {
      'instance from array': ["hello", "foo"],
      'instance from Set': new Set(["hello", "foo"]),
    };
    Object.keys(inputs).forEach(testName => {
      const input = inputs[testName];
      describe(testName, function () {
        let instance;
        it('should create a new instance', function () {
          instance = new HashSet(input);
        });

        it('should set the right size', function () {
          instance.size.should.equal(2);
        });

        it('should have the first item', function () {
          instance.has("hello").should.equal(true);
        });

        it('should have the second item', function () {
          instance.has("foo").should.equal(true);
        });

        it('should add the first item again', function () {
          instance.add("hello");
        });

        it('should not have incremented the size', function () {
          instance.size.should.equal(2);
        });

        it('should add a new item', function () {
          instance.add("qux");
        });

        it('should have incremented the size', function () {
          instance.size.should.equal(3);
        });

        it('should have all the entries', function () {
          instance.has("hello").should.equal(true);
          instance.has("foo").should.equal(true);
          instance.has("qux").should.equal(true);
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

  PRIMITIVE_NAMES.forEach((entryTypeName, typeIndex) => {
    let HashSet;
    let EntryType;

    before(() => {
      EntryType = T[entryTypeName];
    });

    describe(`HashSet<${entryTypeName}>`, function () {
      let instance;
      let entry;
      let otherEntry;
      let value;

      before(() => {
        HashSet = new HashSetType(EntryType);
        entry = EntryType.randomValue();
        otherEntry = EntryType.randomValue();
        // avoid cases where we generate duplicate entries
        let count = 0;
        while (entry === otherEntry && count < 100) {
          count++;
          otherEntry = EntryType.randomValue();
        }
        if (entry === otherEntry) {
          throw new Error('Could not generate another entry for ' + entryTypeName);
        }

      });

      it('should set the right name', function () {
        HashSet.name.should.equal(`HashSet<${entryTypeName}>`);
      });

      it('should set the correct byte alignment', function () {
        HashSet.byteAlignment.should.equal(Math.max(8, EntryType.byteAlignment));
      });

      it('should create a random instance', function () {

        instance = HashSet.randomValue();
        HashSet.accepts(instance).should.equal(true);
        instance.size.should.be.above(0);

        let count = 0;
        for (let entry of instance) {
          EntryType.accepts(entry).should.equal(true);
          count++;
        }
        count.should.equal(instance.size);
      });

      it('should create a new hash set', function () {
        instance = new HashSet();
      });

      it('should have the right initial size', function () {
        instance.size.should.equal(0);
      });

      it('should add a value to the set', function () {
        instance.add(entry);
      });

      it('should have the right size after adding 1 value', function () {
        instance.size.should.equal(1);
      });

      it('should have the given entry', function () {
        instance.has(entry).should.equal(true);
      });

      it('should not have the other entry', function () {
        instance.has(otherEntry).should.equal(false);
      });

      it('should add the other entry', function () {
        instance.add(otherEntry);
      });

      it('should have the right size after adding the other entry', function () {
        instance.size.should.equal(2);
      });

      it('should have the other entry', function () {
        instance.has(otherEntry).should.equal(true);
      });

      it('should remove the first entry', function () {
        instance.delete(entry).should.equal(true);
      });

      it('should have the right size', function () {
        instance.size.should.equal(1);
      });

      it('should not remove the first entry twice', function () {
        instance.delete(entry).should.equal(false);
      });

      it('should have the right size', function () {
        instance.size.should.equal(1);
      });

      it('should remove the second entry', function () {
        instance.delete(otherEntry).should.equal(true);
      });

      it('should have the right size after removing all keys', function () {
        instance.size.should.equal(0);
      });

    });
  });

  describe('HashSet within a struct', function () {
    let Container;
    let StringSet;
    let container;
    before(() => {
      StringSet = new HashSetType(T.InternedString);
      Container = new StructType({
        name: T.String,
        dict: StringSet
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

    it('should have an empty hash set', function () {
      container.dict.size.should.equal(0);
    });

    it('should add some items to the dictionary', function () {
      container.dict.add('hello');
      container.dict.add('foo');
      container.dict.add('greetings');
    });

    it('should have the right size', function () {
      container.dict.size.should.equal(3);
    });

    it('should have the items', function () {
      container.dict.has('hello').should.equal(true);
      container.dict.has('foo').should.equal(true);
      container.dict.has('greetings').should.equal(true);
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
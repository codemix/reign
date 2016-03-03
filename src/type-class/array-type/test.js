import {Realm} from "../..";
import {TypedArray} from "./";

import {$Backing, $Address} from "../../symbols";

describeRealm('ArrayType', function (options) {
  let realm;
  let ArrayType;
  let StructType;
  let instance;
  let T;

  before(() => {
    realm = options.realm;
    T = realm.T;
    ArrayType = realm.ArrayType;
    StructType = realm.StructType;
  });

  it('ArrayType should be an instance of realm.TypeClass', function () {
    ArrayType.should.be.an.instanceOf(realm.TypeClass);
  });

  PRIMITIVE_NAMES.forEach(typeName => {
    describe(`Array<${typeName}>`, function () {
      let Type;
      let XArray;
      let array;
      let input;
      before(() => {
        Type = T[typeName];
        XArray = new ArrayType(Type);
        input = Array.from({length: 16}, () => Type.randomValue());
      });

      it(`Array<${typeName}> should be an instance of ArrayType`, function () {
        XArray.should.be.an.instanceOf(ArrayType);
      });

      it('should create an instance of the array', function () {
        array = new XArray(16);
      });

      it(`array should be an instanceOf Array<${typeName}>`, function () {
        array.should.be.an.instanceOf(XArray);
      });

      it('should create an instance of the array from an array', function () {
        array = new XArray(input);
      });

      it('should have the right length', function () {
        array.length.should.equal(input.length);
      });

      it('should have the right contents', function () {
        input.forEach((expected, index) => {
          array[index].should.equal(expected);
        });
      });

      it('should iterate the items in the array', function () {
        let i = 0;
        for (let item of array) {
          item.should.equal(input[i]);
          i++;
        }
      });

      it('should iterate the array with .forEach()', function () {
        array.length.should.equal(16);
        array.forEach((item, index, arr) => {
          item.should.equal(input[index]);
          arr.should.equal(array);
        });
      });

      it('should map over the array with .map()', function () {
        array.length.should.equal(16);
        const out = array.map((item, index, arr) => {
          item.should.equal(input[index]);
          arr.should.equal(array);
          return item + 1;
        });
        out.should.eql(input.map(item => item + 1));
      });

      it('should .filter() the array', function () {
        array.length.should.equal(16);
        const alts = array.filter((item, index, arr) => {
          item.should.equal(input[index]);
          arr.should.equal(array);
          return index % 2;
        });
        alts.length.should.equal(array.length / 2);
        alts.forEach((item, index) => {
          item.should.equal(array[(index * 2) + 1]);
        });
      });

      it('should reduce the array to a final value', function () {
        array.length.should.equal(16);
        const result = array.reduce((acc, item) => {
          acc.push(item);
          return acc;
        }, []);
        result.should.eql(input);
      });

      it('should reduce without an initial value', function () {
        array.length.should.equal(16);
        const result = array.reduce((acc, item) => {
          return item;
        });
        result.should.equal(input[15]);
      });

      it('should clear the array', function () {
        XArray.clear(array[$Backing], array[$Address]);
      });

      it('should have empty values for contents', function () {
        array.length.should.equal(16);
        array.forEach(item => {
          item.should.eql(Type.emptyValue());
        });
      });

      it('should destroy the array', function () {
        XArray.destructor(array[$Backing], array[$Address]);
      });

      it('should now have a length of zero', function () {
        array.length.should.equal(0);
      });

      it('should create a random array', function () {
        const random = XArray.randomValue();
      });

      describe('Multidimensional', function () {
        let Grid;
        let grid;
        before(() => {
          Grid = new ArrayType(XArray);
        });

        it('should create an instance', function () {
          grid = new Grid(Array.from({length: 16}, () => input));
        });

        it('should have the right length', function () {
          grid.length.should.equal(16);
        });

        it('should allow nested lookups', function () {
          grid[1][1].should.equal(input[1]);
        });

      });

      describe('Array within a struct', function () {
        let Simple;
        let simple;
        before(() => {
          Simple = new StructType({value: XArray});
        });

        it('should create an instance', function () {
          simple = new Simple();
        });

        it('should load the property', function () {
          simple.value.should.be.an.instanceOf(XArray);
          simple.value.length.should.equal(0);
        });

        it('should set a new value', function () {
          simple.value = input;
        });

        it('should have cast the value to the right type', function () {
          simple.value.should.be.an.instanceOf(XArray);
        });

        it('should have the right length', function () {
          simple.value.length.should.equal(input.length);
        });

        it('should overwrite the value', function () {
          simple.value = [Type.randomValue()];
        });

        it('should have the right length', function () {
          simple.value.length.should.equal(1);
        });

        it('should create an instance with some values', function () {
          simple = new Simple({value: input});
        });

        it('should have stored the value', function () {
          simple.value.length.should.equal(input.length);
          simple.value.should.be.an.instanceOf(XArray);
          simple.value.map(item => item).should.eql(input);
        });

      });

      describe('Struct within an array', function () {
        let ListNode;
        let ListArray;
        let array;
        before(() => {
          ListNode = new StructType();
          ListNode.finalize({
            value: Type,
            prev: ListNode.ref,
            next: ListNode.ref
          });
        });
        it('should create an array of list items', function () {
          ListArray = new ArrayType(ListNode);
        });
        it('should create a new array instance', function () {
          array = new ListArray(16);
        });
        it('should have set the default values', function () {
          array.length.should.equal(16);
          array.forEach(item => {
            item.value.should.equal(Type.emptyValue());
          });
        });
        it('should create a struct array from input', function () {
          array = new ListArray(input.map(value => ({value})));
        });
        it('should have the right length', function () {
          array.length.should.equal(input.length);
        });
        it('should have set the right values', function () {
          input.forEach((value, index) => {
            array[index].value.should.eql(value);
          });
        });
      });
    });
  });

  it('should create a new base array type', function () {
    const Int32Array = new ArrayType(T.Int32, {
      id: 123,
      name: 'Int32Array'
    });
    realm.registry.add(Int32Array);
  });

  it('T.Int32Array should be an instance of ArrayType', function () {
    T.Int32Array.should.be.an.instanceOf(ArrayType);
  });

  it('should create an instance of the array', function () {
    const instance = new T.Int32Array(20);
  });

  it('should create an instance of the array from an array', function () {
    const input = Array.from({length: 20}, (_, index) => index + 1);
    const instance = new T.Int32Array(input);
  });

  describe('Benchmarks', function () {
    let Custom, Native;
    let custom, native;
    let input;

    it('should set up the types', function () {
      Custom = new ArrayType(T.Int32);
      Native = Int32Array;
      input = Array.from({length: 200}, (_, index) => index + 1);
      custom = new Custom(input);
      native = new Native(input);

      native.length.should.equal(custom.length);
    });

    benchmark('Read single elements', 100000, {
      Custom () {
        return custom[2];
      },
      Native () {
        return native[2];
      }
    });

    benchmark('Read multiple elements', 100000, {
      Custom () {
        return custom[2] + custom[6] + custom[9];
      },
      Native () {
        return native[2] + native[6] + native[9];
      }
    });

    benchmark('Sum elements', 5000, {
      Custom () {
        let total = 0;
        for (let item of custom) {
          total += item;
        }
        return total;
      },
      Native () {
        let total = 0;
        for (let item of native) {
          total += item;
        }
        return total;
      }
    });

    benchmark('.forEach()', 10000, {
      Custom () {
        let total = 0;
        custom.forEach(item => total += item);
        return total;
      },
      Native () {
        let total = 0;
        native.forEach(item => total += item);
        return total;
      }
    });

    benchmark('.map()', 10000, {
      Custom () {
        return custom.map(item => item + 1);
      },
      Native () {
        return native.map(item => item + 1);
      }
    });

    benchmark('.filter()', 10000, {
      Custom () {
        return custom.filter((item, index) => index % 2);
      },
      Native () {
        return native.filter((item, index) => index % 2);
      }
    });

    benchmark('.reduce()', 10000, {
      Custom () {
        return custom.reduce((acc, item) => {
          return acc + item;
        }, 0);
      },
      Native () {
        return native.reduce((acc, item) => {
          return acc + item;
        }, 0);
      }
    });

    benchmark('.reduce() without an initial value', 10000, {
      Custom () {
        return custom.reduce((acc, item) => item);
      },
      Native () {
        return native.reduce((acc, item) => item);
      }
    });

    benchmark('Create instances', 2000, {
      Custom () {
        return new Custom(input);
      },
      Native () {
        return new Native(input);
      }
    });
  });
});
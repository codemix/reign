import {Realm} from "../..";
import {Struct} from "./";

import {$Backing, $Address} from "../../symbols";

describeRealm('StructType', function (options) {
  let realm;
  let StructType;
  let T;
  let RGBA;

  before(() => {
    realm = options.realm;
    StructType = realm.StructType;
    T = realm.T;
  });

  it('StructType should be an instance of realm.TypeClass', function () {
    StructType.should.be.an.instanceOf(realm.TypeClass);
  });

  describe('Simple', function () {
    let struct;
    let SimpleStruct;

    it('should create a new struct type', function () {
      SimpleStruct = new StructType('SimpleStruct', {
        value: T.Uint8
      });
    });

    it('SimpleStruct should be an instance of StructType', function () {
      SimpleStruct.should.be.an.instanceOf(StructType);
    });


    it('should create an instance', function () {
      struct = new SimpleStruct({value: 33})
    });

    it('struct should be an instance of SimpleStruct', function () {
      struct.should.be.an.instanceOf(SimpleStruct);
    });

    it('should get a field value', function () {
      struct.value.should.equal(33);
    });

    it('should set a field value', function () {
      struct.value = 77;
    });

    it('should get a field value again', function () {
      struct.value.should.equal(77);
    });

    it('should convert the struct to JSON', function () {
      JSON.parse(JSON.stringify(struct)).should.eql({
        value: 77
      });
    });

    it('should clean up the struct', function () {
      SimpleStruct.cleanup(struct[$Backing], struct[$Address]);
    });

    it('should have reset the value to zero', function () {
      struct.value.should.equal(0);
    });
  });

  describe('Multiple fields', function () {
    let struct;

    it('should create a new struct type', function () {
      RGBA = new StructType('RGBA', {
        r: T.Uint8,
        g: T.Uint8,
        b: T.Uint8,
        a: T.Uint8,
      }, {
        defaults: {
          a: 255
        }
      });
    });

    it('RGBA should be an instance of StructType', function () {
      RGBA.should.be.an.instanceOf(StructType);
    });

    it('should create an instance with default field values', function () {
      struct = new RGBA();
    });

    it('struct should be an instance of RGBA', function () {
      struct.should.be.an.instanceOf(RGBA);
    });

    it('should have the right initial field values', function () {
      struct.r.should.equal(0);
      struct.g.should.equal(0);
      struct.b.should.equal(0);
      struct.a.should.equal(255);
    });

    it('should create an instance, specifying some initial values', function () {
      struct = new RGBA({
        r: 127,
        g: 127
      });
    });

    it('should have the right initial field values', function () {
      struct.r.should.equal(127);
      struct.g.should.equal(127);
      struct.b.should.equal(0);
      struct.a.should.equal(255);
    });

    it('should create an instance, overriding a default value', function () {
      struct = new RGBA({
        a: 5
      });
    });

    it('should have the right initial field values', function () {
      struct.r.should.equal(0);
      struct.g.should.equal(0);
      struct.b.should.equal(0);
      struct.a.should.equal(5);
    });

    it('should create an instance, specifying all field values', function () {
      struct = new RGBA({
        r: 127,
        g: 127,
        b: 127,
        a: 230
      });
    });

    it('should have the right initial field values', function () {
      struct.r.should.equal(127);
      struct.g.should.equal(127);
      struct.b.should.equal(127);
      struct.a.should.equal(230);
    });

    it('should set field values', function () {
      struct.r = 12;;
      struct.g = 127;;
      struct.b = 230;;
      struct.a = 255;;
    });

    it('should get a field value', function () {
      struct.r.should.equal(12);
      struct.g.should.equal(127);
      struct.b.should.equal(230);
      struct.a.should.equal(255);
    });

    it('should convert the struct to JSON', function () {
      JSON.parse(JSON.stringify(struct)).should.eql({
        r: 12,
        g: 127,
        b: 230,
        a: 255,
      });
    });

    it('should clean up the struct', function () {
      RGBA.cleanup(struct[$Backing], struct[$Address]);
    });

    it('should have reset the field values to zero', function () {
      struct.r.should.equal(0);
      struct.g.should.equal(0);
      struct.b.should.equal(0);
      struct.a.should.equal(0);
    });

    describe('.hashValue()', function () {
      it('should hash a struct', function () {
        const hash = RGBA.hashValue(struct);
        RGBA.hashValue(struct).should.equal(hash);
        struct.g = 56;
        RGBA.hashValue(struct).should.not.equal(hash);
      });
    });

    describe('.randomValue()', function () {
      it('should create a random value', function () {
        const pixel = RGBA.randomValue();
        pixel.should.be.an.instanceOf(RGBA);
      });
    });

    describe('.compareValues()', function () {
      it('should compare the same pixel', function () {
        const a = new RGBA();
        RGBA.compareValues(a, a).should.equal(0);
      });
      it('should compare two identical pixels', function () {
        const a = new RGBA();
        const b = new RGBA();
        RGBA.compareValues(a, b).should.equal(0);
      });

      it('should compare two different pixels, with the same fields different', function () {
        const a = new RGBA({r: 1});
        const b = new RGBA({r: 2});
        RGBA.compareValues(a, b).should.equal(-1);
      });

      it('should compare two different pixels, with different fields', function () {
        const a = new RGBA({r: 1, g: 2, b: 3});
        const b = new RGBA({r: 1, g: 2, b: 2});
        RGBA.compareValues(a, b).should.equal(1);
      });
    });

    describe('.compareAddresses()', function () {
      it('should compare the same pixel', function () {
        const a = new RGBA();
        RGBA.compareAddresses(a[$Backing], a[$Address], a[$Address]).should.equal(0);
      });
      it('should compare two identical pixels', function () {
        const a = new RGBA();
        const b = new RGBA();
        RGBA.compareAddresses(a[$Backing], a[$Address], b[$Address]).should.equal(0);
      });

      it('should compare two different pixels, with the same fields different', function () {
        const a = new RGBA({r: 1});
        const b = new RGBA({r: 2});
        RGBA.compareAddresses(a[$Backing], a[$Address], b[$Address]).should.equal(-1);
      });

      it('should compare two different pixels, with different fields', function () {
        const a = new RGBA({r: 1, g: 2, b: 3});
        const b = new RGBA({r: 1, g: 2, b: 2});
        RGBA.compareAddresses(a[$Backing], a[$Address], b[$Address]).should.equal(1);
      });
    });

    describe('.compareAddressValue()', function () {
      it('should compare the same pixel', function () {
        const a = new RGBA();
        RGBA.compareAddressValue(a[$Backing], a[$Address], a).should.equal(0);
      });
      it('should compare two identical pixels', function () {
        const a = new RGBA();
        const b = new RGBA();
        RGBA.compareAddressValue(a[$Backing], a[$Address], b).should.equal(0);
      });

      it('should compare two different pixels, with the same fields different', function () {
        const a = new RGBA({r: 1});
        const b = new RGBA({r: 2});
        RGBA.compareAddressValue(a[$Backing], a[$Address], b).should.equal(-1);
      });

      it('should compare two different pixels, with different fields', function () {
        const a = new RGBA({r: 1, g: 2, b: 3});
        const b = new RGBA({r: 1, g: 2, b: 2});
        RGBA.compareAddressValue(a[$Backing], a[$Address], b).should.equal(1);
      });
    });

  });

  describe('Struct within a struct', function () {
    let Box;
    let struct;

    it('should create a new struct type', function () {
      Box = new StructType('Box', [
        ['top', RGBA],
        ['right', RGBA],
        ['bottom', RGBA],
        ['left', RGBA]
      ]);
    });

    it('Box should be an instance of StructType', function () {
      Box.should.be.an.instanceOf(StructType);
    });

    it('should have the right size', function () {
      Box.byteLength.should.equal(16);
    });

    it('should create an instance with default field values', function () {
      struct = new Box();
    });

    it('struct should be an instance of Box', function () {
      struct.should.be.an.instanceOf(Box);
    });

    it('should have the right initial field values', function () {
      struct.top.toJSON().should.eql({
        r: 0,
        g: 0,
        b: 0,
        a: 255
      });
      struct.right.toJSON().should.eql({
        r: 0,
        g: 0,
        b: 0,
        a: 255
      });
      struct.bottom.toJSON().should.eql({
        r: 0,
        g: 0,
        b: 0,
        a: 255
      });
      struct.left.toJSON().should.eql({
        r: 0,
        g: 0,
        b: 0,
        a: 255
      });
    });

    it('should convert the whole structure to JSON', function () {
      JSON.parse(JSON.stringify(struct)).should.eql({
        top: {
          r: 0,
          g: 0,
          b: 0,
          a: 255
        },
        right: {
          r: 0,
          g: 0,
          b: 0,
          a: 255
        },
        bottom: {
          r: 0,
          g: 0,
          b: 0,
          a: 255
        },
        left: {
          r: 0,
          g: 0,
          b: 0,
          a: 255
        },
      })
    });
  });

  describe('Struct with self-referential pointers', function () {
    let Tree;
    let root;
    let vanilla;

    it('should define a Tree struct, but delay finalization', function () {
      Tree = new StructType('Tree');
    });

    it('should not allow instantiation until the struct is finalized', function () {
      (() => new Tree()).should.throw(ReferenceError);
    });

    it('should finalize the struct', function () {
      Tree.finalize({
        value: T.Uint32,
        left: Tree.ref,
        right: Tree.ref
      });
    });

    it('should create a root node', function () {
      root = new Tree({value: 5});
    });

    it('root should be an instance of Tree', function () {
      root.should.be.an.instanceOf(Tree);
    });

    it('should have the right initial structure', function () {
      root.value.should.equal(5);
      (root.left === null).should.equal(true);
      (root.right === null).should.equal(true);
    });

    it('should add branches to the node', function () {
      root.left = {value: 1};
      root.right = {value: 10};
    });

    it('should have the right structure after adding branches', function () {
      JSON.parse(JSON.stringify(root)).should.eql({
        value: 5,
        left: {
          value: 1,
          left: null,
          right: null
        },
        right: {
          value: 10,
          left: null,
          right: null
        }
      });
    });

    it('should add deeper branches', function () {
      root.left.left = {value: root.left.value};
      root.left.value = 3;
      root.right.right = {value: 100};
    });

    it('should have the right structure after adding deeper branches', function () {
      vanilla = JSON.parse(JSON.stringify(root));
      vanilla.should.eql({
        value: 5,
        left: {
          value: 3,
          left: {
            value: 1,
            left: null,
            right: null
          },
          right: null
        },
        right: {
          value: 10,
          left: null,
          right: {
            value: 100,
            left: null,
            right: null
          }
        }
      });
    });

    benchmark('Read struct values', 100000, {
      Struct () {
        return root.value;
      },
      Object () {
        return vanilla.value;
      }
    });

    benchmark('Read nested struct values', 100000, {
      Struct () {
        return root.left.value;
      },
      Object () {
        return vanilla.left.value;
      }
    });

    benchmark('Read deeply nested struct values', 10000, {
      Struct () {
        return root.right.right.value;
      },
      Object () {
        return vanilla.right.right.value;
      }
    });
  });


});
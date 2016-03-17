import {Realm} from "../..";
import {Struct} from "./";

import {$Backing, $Address} from "../../symbols";

describeRealm('EnumType', function (options) {
  let realm;
  let StructType;
  let EnumType;
  let T;
  before(() => {
    realm = options.realm;
    StructType = realm.StructType;
    EnumType = realm.EnumType;
    T = realm.T;
  });

  describe('Tiny Enums', function () {
    let Status;
    let Field;
    let field;

    it('should create a tiny enum when given less than 256 values', function () {
      Status = new EnumType("valid", "invalid");
    });

    it('should have the right byte length and alignment', function () {
      Status.byteLength.should.equal(1);
      Status.byteAlignment.should.equal(1);
    });

    it('should create a struct containing the enum', function () {
      Field = new StructType({
        name: T.InternedString,
        value: T.Any,
        status: Status
      });
    });

    it('should create a field instance', function () {
      field = new Field();
    });

    it('should have set the right initial value', function () {
      field.status.should.equal("valid");
    });

    it('should not set the status to a bad value', function () {
      (() => field.status = "nope").should.throw(TypeError);
    });

    it('should set the status to a new value', function () {
      field.status = "invalid";
    });

    it('should have updated the status', function () {
      field.status.should.equal("invalid");
    });

    describe('.randomValue()', function () {
      it('should generate a random value', function () {
        let value = Status.randomValue();
        const seen = value;
        (value === "valid" || value === "invalid").should.equal(true);
        for (let i = 0; i < 100; i++) {
          value = Status.randomValue();
          if (value !== seen) {
            if (seen === "invalid") {
              value.should.equal("valid");
            }
            else {
              value.should.equal("invalid");
            }
            return;
          }
        }
        throw new Error("Should have seen the other value in 100 attempts!");
      });
    });

    describe('EnumArray', function () {
      let arr;
      it('should create a Status.Array instance', function () {
        arr = new Status.Array(3);
      });

      it('should have a length of 3', function () {
        arr.length.should.equal(3);
      });

      it('should be full of "valid" values', function () {
        arr.forEach(item => item.should.equal("valid"));
      });

      it('should write some values', function () {
        arr[0] = "invalid";
        arr[1] = "invalid";
        arr[2] = "invalid";
      });

      it('should have the right values', function () {
        arr[0].should.equal("invalid");
        arr[1].should.equal("invalid");
        arr[2].should.equal("invalid");
      });

      it('should overwrite a value', function () {
        arr[1] = "valid";
      });

      it('should have overwritten the value', function () {
        arr.toJSON().should.eql(["invalid", "valid", "invalid"]);
      });

      it('should not overwrite with an invalid value', function () {
        (() => arr[0] = "no").should.throw(TypeError);
      });
    });
  });

  describe('Large Enums', function () {
    let Status;
    let Field;
    let field;

    it('should create a large enum when given more than 256 values', function () {
      Status = new EnumType(...Array.from({length: 512}, (_, index) => index));
    });

    it('should have the right byte length and alignment', function () {
      Status.byteLength.should.equal(2);
      Status.byteAlignment.should.equal(2);
    });

    it('should create a struct containing the enum', function () {
      Field = new StructType({
        name: T.InternedString,
        value: T.Any,
        status: Status
      });
    });

    it('should create a field instance', function () {
      field = new Field();
    });

    it('should have set the right initial value', function () {
      field.status.should.equal(0);
    });

    it('should not set the status to a bad value', function () {
      (() => field.status = "nope").should.throw(TypeError);
      (() => field.status = -123).should.throw(TypeError);
      (() => field.status = 1024).should.throw(TypeError);
    });

    it('should set the status to a new value', function () {
      field.status = 123;
    });

    it('should have updated the status', function () {
      field.status.should.equal(123);
    });

    describe('EnumArray', function () {
      let arr;
      it('should create a Status.Array instance', function () {
        arr = new Status.Array(3);
      });

      it('should have a length of 3', function () {
        arr.length.should.equal(3);
      });

      it('should be full of 0 values', function () {
        arr.forEach(item => item.should.equal(0));
      });

      it('should write some values', function () {
        arr[0] = 1;
        arr[1] = 2;
        arr[2] = 3;
      });

      it('should have the right values', function () {
        arr[0].should.equal(1);
        arr[1].should.equal(2);
        arr[2].should.equal(3);
      });

      it('should overwrite a value', function () {
        arr[1] = 66;
      });

      it('should have overwritten the value', function () {
        arr.toJSON().should.eql([1, 66, 3]);
      });

      it('should not overwrite with an invalid value', function () {
        (() => arr[0] = "no").should.throw(TypeError);
      });
    });
  });

});
import {make, TypedObject} from "./";

describe('TypeClass', function () {
  let TypeClass;
  before(() => {
    TypeClass = make({});
  });

  describe('PrimitiveType', function () {
    let PrimitiveType;
    let Double;
    let instance;

    before(() => {
      const prot = {
        baz () {
          return 'qux'
        }
      };
      Object.setPrototypeOf(prot, TypedObject.prototype);

      PrimitiveType = new TypeClass('PrimitiveType', (config) => {
        return {
          name: config.name,
          constructor () {},
          prototype: Object.create(prot, {
            foo: {
              value () {
                return 'bar';
              }
            }
          }),
          byteAlignment: config.byteAlignment,
          byteLength: config.byteLength
        };
      });
    });

    it('should create a new TypeClass instance', function () {
      PrimitiveType.should.be.an.instanceOf(TypeClass);
    });

    it('PrimitiveType should be an instance of Function', function () {
      PrimitiveType.should.be.an.instanceOf(Function);
    });

    it('should create a new primitive type', function () {
      Double = new PrimitiveType({
        name: 'Double',
        byteAlignment: 8,
        byteLength: 8
      });
    });

    it('Double should be an instance of PrimitiveType', function () {
      Double.should.be.an.instanceOf(PrimitiveType);
    });

    it('Double should be an instance of Function', function () {
      Double.should.be.an.instanceOf(Function);
    });

    it('Double should not be an instance of TypeClass', function () {
      Double.should.not.be.an.instanceOf(TypeClass);
    });

    it('Double should not be an instance of TypedObject', function () {
      Double.should.not.be.an.instanceOf(TypedObject);
    });

    it('should create an instance of Double', function () {
      instance = new Double();
      instance.should.be.an.instanceOf(Double);
    });

    it('instance should be an instance of TypedObject', function () {
      instance.should.be.an.instanceOf(TypedObject);
    });

    it('should inherit prototype methods', function () {
      instance.foo().should.equal('bar');
    });

    it('should inherit deeper prototype methods', function () {
      instance.baz().should.equal('qux');
    });
  });

  describe('ArrayType', function () {
    let ArrayType;
    let User;
    let UserArrayType
    let UserArray;
    let instance;

    before(() => {

      User = {
        name: 'User'
      };

      ArrayType = new TypeClass('ArrayType', (ElementType) => {

        const TypedArray$prototype = {

        };

        Object.setPrototypeOf(TypedArray$prototype, TypedObject.prototype);

        return new TypeClass(`Array<${ElementType.name}>`, length => {
          const FixedLengthArray$prototype = Object.create(TypedArray$prototype, {
            length: {
              enumerable: true,
              value: length
            }
          });

          return {
            name: `Array<${ElementType.name}>(${length})`,
            constructor () {},
            prototype: FixedLengthArray$prototype
          };
        });
      });
    });

    it('ArrayType should be an instance of TypeClass', function () {
      ArrayType.should.be.an.instanceOf(TypeClass);
    });

    it('ArrayType should be an instance of Function', function () {
      ArrayType.should.be.an.instanceOf(Function);
    });

    it('should define a UserArrayType', function () {
      UserArrayType = new ArrayType(User);
    });

    it('UserArrayType should be an instance of ArrayType', function () {
      UserArrayType.should.be.an.instanceOf(ArrayType);
    });

    it('UserArrayType should be an instance of Function', function () {
      UserArrayType.should.be.an.instanceOf(Function);
    });

    it('should define a UserArray', function () {
      UserArray = new UserArrayType(123);
    });

    it('UserArray should be an instance of UserArrayType', function () {
      UserArray.should.be.an.instanceOf(UserArrayType);
    });


    it('UserArray should be an instance of Function', function () {
      UserArray.should.be.an.instanceOf(Function);
    });

    it('should instantiate a UserArray', function () {
      instance = new UserArray();
    });

    it('instance should be an instance of UserArray', function () {
      instance.should.be.an.instanceOf(UserArray);
    });

    it('instance should be an instance of TypedObject', function () {
      instance.should.be.an.instanceOf(TypedObject);
    });

    it('UserArrayType should still be an instance of ArrayType', function () {
      UserArrayType.should.be.an.instanceOf(ArrayType);
    });

    it('UserArray should still be an instance of UserArrayType', function () {
      UserArray.should.be.an.instanceOf(UserArrayType);
    });

  });

});
/* @flow */
import Backing from "backing";
import {TypedObject} from "../";
import {alignTo} from "../../util";

import {
  createInitializeStruct,
  createStoreStruct,
  createToJSON,
  createStructDestructor,
  createClearStruct,
  createAccepts,
  createEqual,
  createCompareValues,
  createCompareAddresses,
  createCompareAddressValue,
  createHashStruct,
  createRandomValue
} from "./methods";

import type {Realm} from "../../";

type StructFieldsConfigObject = {
  [name: string]: Type;
};

type StructFieldsArrayConfig = [string, Type][];

export type StructFieldsConfig = StructFieldsConfigObject | StructFieldsArrayConfig;

export type StructOptions = {
  defaults?: Object;
};

import {
  $Backing,
  $Address,
  $isType,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences
} from "../../symbols";

export const MIN_TYPE_ID = Math.pow(2, 20) * 2;

export class Struct extends TypedObject {}

export function make (realm: Realm): TypeClass<StructType<any>> {
  const {TypeClass, ReferenceType, backing} = realm;
  let typeCounter = 0;
  return new TypeClass('StructType', function (fields?: Type|StructFieldsConfig, lengthOrOptions?: number| StructOptions, options?: StructOptions) {

    return (Partial: Function) => {

      typeCounter++;

      type Metadata = {
        byteLength: uint32;
        byteAlignment: uint32;
        canContainReferences: boolean;
      };

      Partial[$CanBeEmbedded] = true;
      Partial[$CanBeReferenced] = true;
      let StructArray;
      // @flowIssue 285
      Object.defineProperties(Partial, {
        name: {
          configurable: true,
          value: `%Struct<0x${typeCounter.toString(16)}>`
        },
        flowType: {
          configurable: true,
          value () {
            return 'Object';
          }
        },
        Array: {
          get () {
            if (StructArray === undefined) {
              StructArray = new realm.ArrayType(Partial);
            }
            return StructArray;
          }
        }
      });

      const prototype = Object.create(Struct.prototype);

      let isFinalized = false;

      /**
       * Holds information about the size and layout of the struct.
       */
      const metadata: Metadata = {
        byteLength: 0,
        byteAlignment: 0,
        canContainReferences: false
      };

      /**
       * The specialized type which references this kind of struct.
       */
      const Reference = new ReferenceType(Partial);

      /**
       * The constructor for struct type instances.
       */
      function constructor (backingOrInput: ?Backing|Object, address?: float64, embedded?: boolean) {
        if (!isFinalized) {
          throw new ReferenceError(`Cannot create an instance of a struct before it is finalized.`);
        }
        else if (backingOrInput instanceof Backing) {
          this[$Backing] = backingOrInput;
          this[$Address] = address;
          this[$CanBeReferenced] = !embedded;
        }
        else {
          this[$Backing] = backing;
          this[$Address] = createStruct(backing, backingOrInput);
          this[$CanBeReferenced] = true;
        }
      }

      /**
       * Allocate space for the given struct and write the input if any.
       */
      function createStruct (backing: Backing, input: any): float64 {
        const address = backing.gc.alloc(metadata.byteLength, Partial.id);
        Partial.initialize(backing, address, input);
        return address;
      }

      /**
       * Finalize the layout of the fields within the struct.
       */
      function finalizeLayout (
        fieldsConfig: Type|StructFieldsConfig, lengthOrOptions?: number | StructOptions, options?: StructOptions): typeof Partial {
        //fieldsConfig: StructFieldsConfig, options: StructOptions = {}): typeof Partial {

        if (isFinalized) {
          throw new Error(`Struct layout is already finalized`);
        }

        if (typeof lengthOrOptions === 'number') {
          const ElementType: any = fieldsConfig;
          fieldsConfig = Array.from({length: lengthOrOptions}, (_, index) => [String(index), ElementType]);
          options = options || {};
        }
        else {
          options = lengthOrOptions || {};
        }

        const fields = processStructConfig(fieldsConfig, options);
        const fieldOffsets = {};
        const fieldTypes = {};

        for (const field of fields) {
          const {name, type} = field;
          if (type.byteAlignment > metadata.byteAlignment) {
            metadata.byteAlignment = type.byteAlignment;
          }

          field.offset = alignTo(metadata.byteLength, type.byteAlignment);
          metadata.byteLength = field.offset + type.byteLength;

          fieldOffsets[name] = field.offset;
          fieldTypes[name] = type;

          defineAccessors(field);
          /* @flowIssue 252 */
          if (type[$CanContainReferences]) {
            metadata.canContainReferences = true;
          }
        }
        metadata.byteLength = alignTo(metadata.byteLength, metadata.byteAlignment);

        Object.freeze(fieldOffsets);
        Object.freeze(fieldTypes);

        Partial[$CanContainReferences] = metadata.canContainReferences;

        Object.defineProperties(Partial, {
          id: {
            value: options.id || (MIN_TYPE_ID + typeCounter)
          },
          name: {
            value: options.name || `%StructType<0x${typeCounter.toString(16)}>`
          },
          byteLength: {
            value: metadata.byteLength
          },
          byteAlignment: {
            value: metadata.byteAlignment
          },
          fieldOffsets: {
            value: fieldOffsets
          },
          fieldTypes: {
            value: fieldTypes
          },
          accepts: {
            value: createAccepts(fields)
          },
          initialize: {
            value: createInitializeStruct(Partial, fields)
          },
          store: {
            value: createStoreStruct(Partial, fields)
          },
          load: {
            value (backing: Backing, address: float64, embedded: boolean): Partial {
              return new Partial(backing, address, embedded);
            }
          },
          clear: {
            value: createClearStruct(fields)
          },
          destructor: {
            value: createStructDestructor(fields)
          },
          equal: {
            value: createEqual(fields)
          },
          compareValues: {
            value: createCompareValues(fields)
          },
          compareAddresses: {
            value: createCompareAddresses(fields)
          },
          compareAddressValue: {
            value: createCompareAddressValue(fields)
          },
          hashValue: {
            value: createHashStruct(fields)
          },
          randomValue: {
            value: createRandomValue(fields)
          },
          flowType: {
            value () {
              return `{${fields.map(field => `${field.name}: ${field.type.flowType()};`).join('\n')}}`;
            }
          }
        });

        Object.defineProperties(prototype, {
          toJSON: {
            value: createToJSON(fields)
          }
        });

        isFinalized = true;
        realm.registry.add(Partial);
        return Partial;
      }

      /**
       * Define the getter and setter for a field.
       */
      function defineAccessors<T> (field: StructField<T>): void {
        const {name, type, offset} = field;
        // @flowIssue 252
        const embedded = type[$CanBeEmbedded];
        Object.defineProperty(prototype, name, {
          enumerable: true,
          get (): any {
            return type.load(this[$Backing], this[$Address] + offset, embedded);
          },
          set (value: any) {
            type.store(this[$Backing], this[$Address] + offset, value);
          }
        });
      }

      /**
       * Normalize the configuration for a struct and return a list of fields.
       */
      function processStructConfig (fields: StructFieldsConfig, options: StructOptions): StructField<any>[] {
        const normalized = [];
        const defaults = options.defaults || {};
        if (Array.isArray(fields)) {
          const names = new Set();
          for (const [name, type] of fields) {
            if (names.has(name)) {
              throw new TypeError(`A field with the name "${name}" already exists.`);
            }
            /* @flowIssue 252 */
            if (!type || !type[$isType]) {
              throw new TypeError(`Field "${name}" must be a finalized type.`);
            }

            names.add(name);
            normalized.push({
              name: name,
              offset: 0,
              default: defaults.hasOwnProperty(name) ? () => defaults[name] : () => type.emptyValue(true),
              type: type
            });
          }
          return normalized;
        }
        else {
          for (const name of Object.keys(fields)) {
            const type = fields[name];
            /* @flowIssue 252 */
            if (!type || !type[$isType]) {
              throw new TypeError(`Field "${name}" must be a finalized type.`);
            }
            normalized.push({
              name: name,
              offset: 0,
              default: defaults.hasOwnProperty(name) ? () => defaults[name] : () => type.emptyValue(true),
              type: type
            });
          }
          return optimizeFieldLayout(normalized);
        }
      }

      /**
       * Given an object mapping field names to types, return an array which
       * contains the fields in an order optimized for the smallest possible struct size,
       * whilst still respecting each field's alignment requirements.
       *
       * @fixme this is not currently very good, can do better.
       */
      function optimizeFieldLayout (fields: StructField<any>[]): StructField<any>[] {
        return fields.sort(compareFieldsByByteAlignmentOrName);
      }

      /**
       * Comparator used for sorting fields based on the byteAlignment of their types.
       * If two fields have the same byte alignment, they will be compared by name instead.
       */
      function compareFieldsByByteAlignmentOrName (a, b) {
        if (a.type.byteAlignment > b.type.byteAlignment) {
          return 1;
        }
        else if (a.type.byteAlignment < b.type.byteAlignment) {
          return -1;
        }
        else {
          if (a.name > b.name) {
            return 1;
          }
          else if (a.name < b.name) {
            return -1;
          }
          return 0;
        }
      }

      if (fields != null) {
        finalizeLayout(fields, lengthOrOptions, options);
      }

      return {
        constructor,
        prototype,
        gc: true,
        ref: Reference,
        finalize: finalizeLayout,
        cast (input: any): ?Partial {
          if (input == null) {
            return null;
          }
          else if (input instanceof Partial) {
            return input;
          }
          else {
            return new Partial(input);
          }
        },
        emptyValue (embedded?: boolean) {
          return embedded ? null : new Partial();
        }
      };
    };
  });
};


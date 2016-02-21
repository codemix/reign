/* @flow */
import Backing from "backing";
import {TypedObject} from "../";

import {
  createInitializeStruct,
  createStoreStruct,
  createToJSON,
  createCleanupStruct,
  createCompareValues,
  createCompareAddresses,
  createCompareAddressValue,
  createHashStruct,
  createRandomValue
} from "./methods";

import type {Realm} from "../../";

import type {$isType} from "../";

type StructFieldsConfigObject = {
  [name: string]: Type<any>|PartialType<any>;
};

type StructFieldsArrayConfig = [string, Type<any>|PartialType<any>][];

export type StructFieldsConfig = StructFieldsConfigObject | StructFieldsArrayConfig;

export type StructOptions = {
  defaults?: Object;
};

import {
  $Backing,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences
} from "../../symbols";

export class Struct extends TypedObject {}

export function make ({TypeClass, ReferenceType, backing: defaultBacking}: Realm): TypeClass<Struct> {
  return new TypeClass('StructType', (name: string, fields: ?StructFieldsConfig, options: ?StructOptions) => {
    return (Partial: Function) => {

      Partial[$CanBeEmbedded] = true;
      Partial[$CanBeReferenced] = true;

      const prototype = Object.create(Struct.prototype);

      let isFinalized = false;

      /**
       * Holds information about the size and layout of the struct.
       */
      const metadata = {
        byteLength: 0,
        byteAlignment: 0,
        structWriter: undefined,
        canContainReferences: false
      };

      /**
       * The specialized type which references this kind of struct.
       */
      const Reference = new ReferenceType(`Reference<${name}>`, Partial);

      /**
       * The constructor for struct type instances.
       */
      function constructor (backingOrInput: ?Backing|Object, address: ?float64) {
        if (!isFinalized) {
          throw new ReferenceError(`Cannot create an instance of ${name} before the struct is finalized.`);
        }
        else if (backingOrInput instanceof Backing) {
          this[$Backing] = backingOrInput;
          this[$Address] = address;
        }
        else {
          this[$Backing] = defaultBacking;
          this[$Address] = createStruct(defaultBacking, backingOrInput);
        }
      }

      /**
       * Allocate space for the given struct and write the input if any.
       */
      function createStruct (backing: Backing, input: any): float64 {
        const address = backing.gc.alloc(metadata.byteLength);
        Partial.initialize(backing, address, input);
        return address;
      }

      /**
       * Finalize the layout of the fields within the struct.
       */
      function finalizeLayout (fieldsConfig: StructFieldsConfig, options: StructOptions = {}): typeof Partial {
        if (isFinalized) {
          throw new Error(`Struct layout is already finalized`);
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
          if (type[$CanContainReferences]) {
            metadata.canContainReferences = true;
          }
        }
        metadata.byteLength = alignTo(metadata.byteLength, metadata.byteAlignment);

        Object.freeze(fieldOffsets);
        Object.freeze(fieldTypes);

        Partial[$CanContainReferences] = metadata.canContainReferences;

        Object.defineProperties(Partial, {
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
          initialize: {
            value: createInitializeStruct(Partial, fields)
          },
          store: {
            value: createStoreStruct(Partial, fields)
          },
          load: {
            value (backing: Backing, address: float64): Partial {
              return new Partial(backing, address);
            }
          },
          cleanup: {
            value: createCleanupStruct(fields)
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
          }
        });

        Object.defineProperties(prototype, {
          toJSON: {
            value: createToJSON(fields)
          }
        });

        isFinalized = true;
        return Partial;
      }

      /**
       * Define the getter and setter for a field.
       */
      function defineAccessors<T> (field: StructField<T>): void {
        const {name, type, offset} = field;
        Object.defineProperty(prototype, name, {
          enumerable: true,
          get (): T {
            return type.load(this[$Backing], this[$Address] + offset);
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
            if (!type || !type[$CanBeEmbedded]) {
              throw new TypeError(`Field "${name}" must be an embeddable, finalized type.`);
            }
            if (names.has(name)) {
              throw new TypeError(`A field with the name "${name}" already exists.`);
            }
            names.add(name);
            normalized.push({
              name: name,
              offset: 0,
              default: defaults[name] || type.emptyValue(),
              type: type
            });
          }
          return normalized;
        }
        else {
          for (const name of Object.keys(fields)) {
            const type = fields[name];
            if (!type || !type[$CanBeEmbedded]) {
              throw new TypeError(`Field "${name}" must be a finalized type.`);
            }
            normalized.push({
              name: name,
              offset: 0,
              default: defaults[name] || type.emptyValue(),
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
        finalizeLayout(fields, options);
      }

      return {
        name,
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
        emptyValue () {
          return null;
        }
      };
    };
  });
};


/**
 * Ensure that the given value is aligned to the given number of bytes.
 */
export function alignTo (value: number, numberOfBytes: number): number {
  const rem = value % numberOfBytes;
  return rem === 0 ? value : value + (numberOfBytes - rem);
}
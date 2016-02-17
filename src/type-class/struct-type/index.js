/* @flow */
import Backing from "backing";
import {TypedObject} from "../";

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

export const $Backing = Symbol.for('Backing');
export const $Address = Symbol.for('Address');

export class Struct extends TypedObject {}

export function make ({TypeClass, ReferenceType, backing: defaultBacking}: Realm): TypeClass<Struct> {
  return new TypeClass('StructType', (name: string, fields?: StructFieldsConfig, options?: StructOptions): Function => {
    return (Partial: Function): Object => {
      const prototype = Object.create(Struct.prototype);

      let isFinalized = false;

      /**
       * Holds information about the size and layout of the struct.
       */
      const metadata = {
        byteLength: 0,
        byteAlignment: 0,
        allocationSize: 0
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
        const address = backing.gc.alloc(metadata.allocationSize);
        initializeStruct(backing, address, input);
        return address;
      }

      /**
       * Initialize the struct at the given address.
       */
      function initializeStruct (backing: Backing, address: float64, input: any) {

        if (input != null) {

        }
        else {

        }
      }

      /**
       * Finalize the layout of the fields within the struct.
       */
      function finalizeLayout (fieldsConfig: StructFieldsConfig, options: StructOptions = {}): typeof Partial {
        if (isFinalized) {
          throw new Error(`Struct layout is already finalized`);
        }

        const fields = processStructConfig(fieldsConfig, options);



        isFinalized = true;
        return Partial;
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
            if (!type || !type[$isType]) {
              throw new TypeError(`Field "${name}" must be a finalized type.`);
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
          for (const name of Object.keys()) {
            const type = fields[name];
            if (!type || !type[$isType]) {
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
      function optimizeFieldLayout (Struct: PartialType, fields: StructField<any>[]): StructField<any>[] {
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
        finalize: finalizeLayout
      };
    };
  });
};
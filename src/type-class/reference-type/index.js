/* @flow */

import {TypedObject} from "../";
import type {Realm} from "../../";
import type Backing from "backing";

import {
  $ValueType,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences
} from "../../symbols";

/**
 * Makes a ReferenceType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<ReferenceType<any>> {
  const {TypeClass} = realm;
  return new TypeClass('ReferenceType', (name: string, Type: Function): Function => {

    return (Reference: Function): Object => {

      Reference[$CanBeEmbedded] = true;
      Reference[$CanBeReferenced] = false;
      Reference[$CanContainReferences] = true;

      if (!Type[$CanBeReferenced]) {
        throw new TypeError(`Type ${Type.name} cannot be referenced.`);
      }

      let ReferenceArray;
      // @flowIssue 285
      Object.defineProperties(Reference, {
        Array: {
          get () {
            if (ReferenceArray === undefined) {
              ReferenceArray = new realm.ArrayType(Reference);
            }
            return ReferenceArray;
          }
        }
      });
      /**
       * Store a reference to the given object at the given address.
       */
      function storeReference (backing: Backing, address: float64, value: ?Object): void {
        if (value == null) {
          backing.setFloat64(address, 0);
        }
        else if (value[$ValueType] === Type && value[$Address]) {
          backing.setFloat64(address, value[$Address]);
        }
        else {
          // @fixme more safety checking here.
          const instance = Type.cast(value);
          backing.gc.ref(instance[$Address]);
          backing.setFloat64(address, instance[$Address]);
        }
      }

      /**
       * Load an object based on the reference stored at the given address.
       */
      function loadReference (backing: Backing, address: float64): ?Type {
        const pointer = backing.getFloat64(address);
        if (pointer === 0) {
          return null;
        }
        else {
          return Type.load(backing, pointer);
        }
      }

      /**
       * Remove a reference at the given address.
       */
      function clearReference (backing: Backing, address: float64) {
        const pointer = backing.getFloat64(address);
        if (pointer !== 0) {
          backing.setFloat64(address, 0);
          backing.gc.unref(pointer);
        }
      }

      /**
       * Destroy a reference at the given address.
       */
      function referenceDestructor (backing: Backing, address: float64) {
        const pointer = backing.getFloat64(address);
        if (pointer !== 0) {
          backing.setFloat64(address, 0);
          backing.gc.unref(pointer);
        }
      }

      return {
        name,
        byteLength: 8,
        byteAlignment: 8,
        initialize: storeReference,
        store: storeReference,
        load: loadReference,
        clear: clearReference,
        destructor: referenceDestructor,
        emptyValue () {
          return null;
        },
        compareValues (valueA: ?Object, valueB: ?Object): int8 {
          return Type.compareValues(valueA, valueB);
        },
        compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8 {
          if (addressA === addressB) {
            return 0;
          }
          else if (addressA === 0) {
            return -1;
          }
          else if (addressB === 0) {
            return 1;
          }
          const pointerA = backing.getFloat64(addressA);
          const pointerB = backing.getFloat64(addressB);

          if (pointerA === pointerB) {
            return 0;
          }
          else if (pointerA === 0) {
            return -1;
          }
          else if (pointerB === 0) {
            return 1;
          }
          else {
            return Type.compareAddresses(backing, pointerA, pointerB);
          }
        },
        compareAddressValue (backing: Backing, address: float64, value: ?Object): int8 {
          const pointer = backing.getFloat64(address);
          if (pointer === 0) {
            if (value == null) {
              return 0;
            }
            else {
              return -1;
            }
          }
          return Type.compareAddressValue(backing, pointer, value);
        },
        randomValue (): any {
          if (Math.random() < 0.5) {
            return null;
          }
          else {
            return Type.randomValue();
          }
        },
        hashValue (input: any): uint32 {
          if (input == null) {
            return 4;
          }
          else {
            return Type.hashValue(input);
          }
        }
      };
    };
  });
};
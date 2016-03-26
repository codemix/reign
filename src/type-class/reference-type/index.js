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
  const {TypeClass, registry} = realm;
  const idRange = registry.range('ReferenceType');
  return new TypeClass('ReferenceType', (Target: Function): Function => {

    return (Reference: Function): Object => {
      const id = idRange.next();
      const name = typeof Target.name === 'string' && Target.name.length > 0 ? `Reference<${Target.name}>` : `%Reference<0x${id.toString(16)}>`;

      Reference[$CanBeEmbedded] = true;
      Reference[$CanBeReferenced] = false;
      Reference[$CanContainReferences] = true;

      if (!Target[$CanBeReferenced]) {
        throw new TypeError(`Type ${Target.name} cannot be referenced.`);
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
       * Initialize a reference to the given object at the given address.
       */
      function initializeReference (backing: Backing, pointerAddress: float64, value?: Object): void {

        if (value == null) {
          backing.setFloat64(pointerAddress, 0);
        }
        else if (value instanceof Target) {
          if (!value[$CanBeReferenced]) {
            throw new ReferenceError(`Cannot reference value of type ${Target.name}`);
          }
          const address = value[$Address];

          backing.gc.ref(address);
          backing.setFloat64(pointerAddress, address);
        }
        else {
          const address = backing.gc.alloc(Target.byteLength, Target.id, 1);
          Target.initialize(backing, address, value);
          backing.setFloat64(pointerAddress, address);
        }
      }

      /**
       * Store a reference to the given object at the given address.
       */
      function storeReference (backing: Backing, pointerAddress: float64, value: ?Object): void {
        const existing = backing.getFloat64(pointerAddress);

        if (value == null) {
          if (existing !== 0) {
            backing.setFloat64(pointerAddress, 0);
          }
          return;
        }
        else if (existing !== 0) {
          backing.gc.unref(existing);
        }

        if (value instanceof Target) {
          if (!value[$CanBeReferenced]) {
            throw new ReferenceError(`Cannot reference value of type ${Target.name}`);
          }
          const address = value[$Address];
          backing.gc.ref(address);
          backing.setFloat64(pointerAddress, address);
        }
        else {
          const address = backing.gc.alloc(Target.byteLength, Target.id, 1);
          Target.initialize(backing, address, value);
          backing.setFloat64(pointerAddress, address);
        }
      }

      /**
       * Load an object based on the reference stored at the given address.
       */
      function loadReference (backing: Backing, pointerAddress: float64): ?Target {
        const address = backing.getFloat64(pointerAddress);
        if (address === 0) {
          return null;
        }
        else {
          return Target.load(backing, address);
        }
      }

      /**
       * Remove a reference at the given address.
       */
      function clearReference (backing: Backing, pointerAddress: float64) {
        const address = backing.getFloat64(pointerAddress);
        if (address !== 0) {
          backing.setFloat64(pointerAddress, 0);
          backing.gc.unref(address);
        }
      }

      /**
       * Destroy a reference at the given address.
       */
      function referenceDestructor (backing: Backing, pointerAddress: float64) {
        const address = backing.getFloat64(pointerAddress);
        if (address !== 0) {
          backing.setFloat64(pointerAddress, 0);
          backing.gc.unref(address);
        }
      }

      return {
        id,
        name,
        byteLength: 8,
        byteAlignment: 8,
        initialize: initializeReference,
        store: storeReference,
        load: loadReference,
        clear: clearReference,
        destructor: referenceDestructor,
        emptyValue () {
          return null;
        },
        equal (valueA: ?Object, valueB: ?Object): boolean {
          if (valueA === valueB) {
            return true;
          }
          else if (!valueA || !valueB) {
            return false;
          }
          else {
            return Target.equal(valueA, valueB);
          }
        },
        compareValues (valueA: ?Object, valueB: ?Object): int8 {
          return Target.compareValues(valueA, valueB);
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
            return Target.compareAddresses(backing, pointerA, pointerB);
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
          return Target.compareAddressValue(backing, pointer, value);
        },
        randomValue (): any {
          if (Math.random() < 0.5) {
            return null;
          }
          else {
            return Target.randomValue();
          }
        },
        hashValue (input: any): uint32 {
          if (input == null) {
            return 4;
          }
          else {
            return Target.hashValue(input);
          }
        },
        flowType () {
          return `Reference<${Target.flowType()}>`;
        }
      };
    };
  });
};
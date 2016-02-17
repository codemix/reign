/* @flow */

import {TypedObject} from "../";
import type {Realm} from "../../";
import type Backing from "backing";

export const $ValueType = Symbol.for('ValueType');
export const $Address = Symbol.for('Address');
export const $ReferenceValue = Symbol.for('ReferenceValue');

export class Reference extends TypedObject {

  valueOf (): any {
    /* @flowIssue 252 */
    return this[$ReferenceValue];
  }

  toJSON (): any {
    return this.valueOf();
  }
}

/**
 * Makes a ReferenceType type class for the given realm.
 */
export function make ({TypeClass}: Realm): TypeClass<Reference> {

  return new TypeClass('ReferenceType', (name: string, Type: Function): Object => {

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
        if (Type.gc) {
          backing.gc.ref(instance[$Address]);
        }
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
    function cleanupReference (backing: Backing, address: float64) {
      const pointer = backing.getFloat64(address);
      if (pointer === 0) {
        return;
      }

      if (Type.gc) {
        backing.gc.unref(pointer);
      }
      backing.setFloat64(address, 0);
    }

    return {
      name,
      byteLength: 8,
      byteAlignment: 8,
      initialize: storeReference,
      store: storeReference,
      load: loadReference,
      cleanup: cleanupReference,
      emptyValue () {
        return null;
      },
      randomValue (): any {
        if (Math.random() < 0.3) {
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
  });
};
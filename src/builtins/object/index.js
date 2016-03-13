/* @flow */

import hashAny from "../../hash-functions/any";

import Backing from "backing";
import type {Realm} from "../..";
import {$Backing, $Address, $CanBeEmbedded, $CanBeReferenced, $CanContainReferences} from "../../symbols";

export function make (realm: Realm): ObjectType<Object> {
  const {ObjectType, T} = realm;

  function constructor (backingOrInput?: Backing|Object, address?: float64) {
    if (!(this instanceof TypedObject)) {
      return TypedObject.cast(backingOrInput);
    }
    if (backingOrInput instanceof Backing) {
      this[$Backing] = backingOrInput;
      this[$Address] = address;
      createAccessors(this);
    }
    else if (backingOrInput == null) {
      this[$Backing] = realm.backing;
      this[$Address] = createEmptyObject(realm.backing);
    }
    else {
      this[$Backing] = realm.backing;
      this[$Address] = createObject(realm.backing, backingOrInput);
      // @fixme we should combine createObject and createAccessors to make this faster.
      createAccessors(this);
    }
  }

  const TypedObject = new ObjectType({
    name: 'Object',
    byteAlignment: 8, // Pointer
    byteLength: 8,
    constructor: constructor,
    cast (input: any): ?Object {
      return input == null ? null : Object(input);
    },
    accepts (input: any): boolean {
      return typeof input === 'object';
    },
    initialize (backing: Backing, pointerAddress: float64, initialValue?: Object): void {
      if (initialValue == null) {
        backing.setFloat64(pointerAddress, 0);
      }
      else {
        backing.setFloat64(pointerAddress, createObject(backing, initialValue, true));
      }
    },
    store (backing: Backing, pointerAddress: float64, value: ?Object): void {
      const existing = backing.getFloat64(pointerAddress);
      if (existing === 0) {
        if (value == null) {
          // nothing to do
          return;
        }
      }
      else {
        backing.gc.unref(existing);
        backing.setFloat64(pointerAddress, 0); // safety: in case the store() fails.
        if (value == null) {
          // all done
          return;
        }
      }

      backing.setFloat64(pointerAddress, createObject(backing, value, true));
    },
    load (backing: Backing, pointerAddress: float64): ?TypedObject {
      const address = backing.getFloat64(pointerAddress);
      if (address === 0) {
        return null;
      }
      else {
        return new TypedObject(backing, address);
      }
    },
    clear (backing: Backing, pointerAddress: float64): void {
      const address = backing.getFloat64(pointerAddress);
      if (address !== 0) {
        backing.setFloat64(pointerAddress, 0);
        backing.gc.unref(address);
      }
    },
    destructor: destroyObject,
    emptyValue (): any {
      return null;
    },
    randomValue (): any {
      return null;
    },
    hashValue: hashAny,
    flowType () {
      return `Object`;
    }
  });

  function createAccessors (target: TypedObject) {
    const backing = target[$Backing];
    const address = target[$Address];
    const length = backing.getUint32(address);
    let current = address + 8;
    for (let i = 0; i < length; i++) {
      const name = T.String.load(backing, current);
      const offset = current + 8;
      Object.defineProperty(target, name, {
        enumerable: true,
        get (): any {
          return T.Any.load(this[$Backing], offset);
        },
        set (value: any): void {
          T.Any.store(this[$Backing], offset, value);
        }
      })
      current += 24;
    }
  }

  function createEmptyObject (backing: Backing, hasReference?: boolean): float64 {
    return backing.gc.calloc(8, TypedObject.id, hasReference ? 1 : 0);
  }

  function createObject (backing: Backing, input: Object, hasReference?: boolean): float64 {
    if (input instanceof TypedObject && input[$Backing] === backing) {
      backing.gc.ref(input[$Address]);
      return input[$Address];
    }
    const keys = Object.keys(input);
    const length = keys.length;
    const address = backing.gc.alloc((length * 24) + 8, TypedObject.id, hasReference ? 1 : 0);
    backing.setUint32(address, length);
    let current = address + 8;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      backing.setFloat64(current, realm.strings.add(key));
      current += 8;
      T.Any.initialize(backing, current, input[key]);
      current += 16;
    }
    return address;
  }

  function loadObject (backing: Backing, address: float64): Object {
    const output = {
      // @flowIssue 252
      [$Backing]: backing,
      // @flowIssue 252
      [$Address]: address
    };
    const length = backing.getUint32(address);
    let current = address + 8;
    for (let i = 0; i < length; i++) {
      output[(T.String.load(backing, current): any)] = T.Any.load(backing, current + 8);
      current += 24;
    }
    return output;
  }

  function clearObject (backing: Backing, address: float64): void {
    const length = backing.getUint32(address);
    let current = address + 8;
    for (let i = 0; i < length; i++) {
      current += 8;
      T.Any.clear(backing, current);
      current += 16;
    }
  }

  function destroyObject (backing: Backing, address: float64): void {
    const length = backing.getUint32(address);
    backing.setUint32(address, 0); // prevent further reads.
    let current = address + 8;
    for (let i = 0; i < length; i++) {
      backing.setFloat64(current, 0);
      current += 8;
      T.Any.clear(backing, current);
      current += 16;
    }
  }

  TypedObject[$CanBeEmbedded] = false;

  return TypedObject;
}
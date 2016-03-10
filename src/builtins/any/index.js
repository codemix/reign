/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";
import {$Backing, $Address, $CanBeEmbedded, $CanBeReferenced, $CanContainReferences} from "../../symbols";

export function make (realm: Realm): PrimitiveType<any> {
  const {PrimitiveType} = realm;
  const Any = new PrimitiveType({
    name: 'Any',
    byteAlignment: 8,
    byteLength: 12,
    cast (input: any): any {
      if (typeof input === 'function' || typeof input === 'symbol') {
        throw new TypeError(`Cannot store values with type: ${typeof input}`);
      }
      else if (input === undefined) {
        return null;
      }
      else {
        return input;
      }
    },
    accepts (input: any): boolean {
      if (typeof input === 'function' || typeof input === 'symbol') {
        return false;
      }
      else {
        return true;
      }
    },
    initialize (backing: Backing, address: float64, initialValue: any): void {
      const Type = realm.typeOf(initialValue);
      let initialAddress;
      if (Type === null) {
        backing.setFloat64(address, 0);
        backing.setUint32(address + 8, 0);
      }
      else if (Type.byteLength <= 8) {
        Type.initialize(backing, address, initialValue);
        backing.setUint32(address + 8, Type.id);
      }
      else if (initialValue[$Backing] === backing && (initialAddress = initialValue[$Address])) {
        backing.setFloat64(address, initialAddress);
        backing.setUint32(address + 8, Type.id);
        backing.gc.ref(initialAddress);
      }
      else {
        const target = backing.gc.alloc(Type.byteLength, Type.id, 1);
        Type.initialize(backing, target, initialValue);
        backing.setFloat64(address, target);
        backing.setUint32(address + 8, Type.id);
      }
    },
    store (backing: Backing, address: float64, value: any): void {
      const Type = realm.typeOf(value);
      const existingTypeId = backing.getUint32(address + 8);
      if (existingTypeId !== 0) {
        const existingType = realm.I[existingTypeId];

        if (existingType === Type && Type.byteLength <= 8) {
          Type.store(backing, address, value);
          return; // nothing left to do.
        }
        else if (existingType.byteLength <= 8) {
          existingType.clear(backing, address);
        }
        else {
          const pointer = backing.getFloat64(address);
          if (pointer !== 0) {
            backing.gc.unref(pointer);
            backing.setFloat64(address, 0); // ensures that the value is cleared, even if store fails.
          }
        }
      }
      let valueAddress;

      if (Type === null) {
        backing.setFloat64(address, 0);
        backing.setUint32(address + 8, 0);
      }
      else if (Type.byteLength <= 8) {
        Type.initialize(backing, address, value);
        backing.setUint32(address + 8, Type.id);
      }
      else if (value[$Backing] === backing && (valueAddress = value[$Address])) {
        backing.setFloat64(address, valueAddress);
        backing.setUint32(address + 8, Type.id);
        backing.gc.ref(valueAddress);
      }
      else {
        const target = backing.gc.alloc(Type.byteLength, Type.id, 1);
        Type.initialize(backing, target, value);
        backing.setFloat64(address, target);
        backing.setUint32(address + 8, Type.id);
      }
    },
    load (backing: Backing, address: float64): any {
      const typeId = backing.getUint32(address + 8);
      if (typeId === 0) {
        return null;
      }
      const Type = realm.I[typeId];
      if (Type.byteLength <= 8) {
        return Type.load(backing, address);
      }
      const pointer = backing.getFloat64(address);
      assert: pointer > 0;
      return Type.load(backing, pointer);
    },
    emptyValue (): any {
      return null;
    },
    randomValue (): any {
      return null;
    },
    hashValue (input): uint32 {
      const Type = realm.typeOf(input);
      if (Type === null) {
        return 4;
      }
      else {
        return Type.hashValue(input);
      }
    }
  });
  Any[$CanBeEmbedded] = true;
  Any[$CanContainReferences] = true;
  Any[$CanBeReferenced] = false;
  return Any;
}
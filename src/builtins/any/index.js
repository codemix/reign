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
    byteLength: 16,
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
        backing.setFloat64(address + 8, 0);
      }
      else if (Type.byteLength <= 8) {
        backing.setFloat64(address, Type.id);
        Type.initialize(backing, address + 8, initialValue);
      }
      else if (initialValue[$Backing] === backing && (initialAddress = initialValue[$Address])) {
        backing.setFloat64(address, Type.id);
        backing.setFloat64(address + 8, initialAddress);
        backing.gc.ref(initialAddress);
      }
      else {
        backing.setFloat64(address, Type.id);
        const target = backing.gc.alloc(Type.byteLength, Type.id, 1);
        Type.initialize(backing, target, initialValue);
        backing.setFloat64(address + 8, target);
      }
    },
    store (backing: Backing, address: float64, value: any): void {
      const Type = realm.typeOf(value);
      const existingTypeId = backing.getFloat64(address);
      if (existingTypeId !== 0) {
        const existingType = realm.I[existingTypeId];

        if (existingType === Type && Type.byteLength <= 8) {
          Type.store(backing, address + 8, value);
          return; // nothing left to do.
        }
        else if (existingType.byteLength <= 8) {
          existingType.clear(backing, address + 8);
        }
        else {
          const pointer = backing.getFloat64(address + 8);
          if (pointer !== 0) {
            backing.gc.unref(pointer);
            backing.setFloat64(address + 8, 0); // ensures that the value is cleared, even if store fails.
          }
        }
      }
      let valueAddress;

      if (Type === null) {
        backing.setFloat64(address, 0);
        backing.setFloat64(address + 8, 0);
      }
      else if (Type.byteLength <= 8) {
        backing.setFloat64(address, Type.id);
        Type.initialize(backing, address + 8, value);
      }
      else if (value[$Backing] === backing && (valueAddress = value[$Address])) {
        backing.setFloat64(address, Type.id);
        backing.setFloat64(address + 8, valueAddress);
        backing.gc.ref(valueAddress);
      }
      else {
        backing.setFloat64(address, Type.id);
        const target = backing.gc.alloc(Type.byteLength, Type.id, 1);
        Type.initialize(backing, target, value);
        backing.setFloat64(address + 8, target);
      }
    },
    load (backing: Backing, address: float64): any {
      const typeId = backing.getFloat64(address);
      if (typeId === 0) {
        return null;
      }
      const Type = realm.I[typeId];
      if (Type.byteLength <= 8) {
        return Type.load(backing, address + 8);
      }
      const pointer = backing.getFloat64(address + 8);
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
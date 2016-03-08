/* @flow */

import type Backing from "backing";
import type {Realm} from "../..";

import randomString from "../../random/string";

export function make (realm: Realm): PrimitiveType<string> {
  const {StringType, T} = realm;
  const pool = realm.strings;

  const RawString = T.String;

  const InternedString = new StringType({
    name: 'InternedString',
    byteLength: 8, // Pointer
    byteAlignment: 8,
    constructor (input) {
      if (this instanceof InternedString) {
        throw new TypeError(`InternedString is not a constructor.`);
      }
      else {
        return input == null ? '' : ''+input;
      }
    },
    cast (input: any): string {
      return input == null ? '' : ''+input;
    },
    accepts (input: any): boolean {
      return typeof input === 'string';
    },
    initialize (backing: Backing, pointerAddress: float64, initialInput?: string): void {
      if (!initialInput) {
        backing.setFloat64(pointerAddress, 0);
      }
      else {
        backing.setFloat64(pointerAddress, pool.add(initialInput));
      }
    },
    store (backing: Backing, pointerAddress: float64, input: string): void {
      const existing: float64 = backing.getFloat64(pointerAddress);
      if (!input) {
        if (existing !== 0) {
          pool.removeStringByPointer(pointerAddress);
          backing.setFloat64(pointerAddress, 0);
        }
      }
      else {
        const address: float64 = pool.add(input);
        if (address !== existing) {
          if (existing !== 0) {
            pool.removeStringByPointer(pointerAddress);
          }
          backing.setFloat64(pointerAddress, address);
        }
      }
    },
    load: RawString.load,
    clear (backing: Backing, pointerAddress: float64): void {
      const existing: float64 = backing.getFloat64(pointerAddress);
      if (existing !== 0) {
        pool.removeStringByPointer(pointerAddress);
        backing.setFloat64(pointerAddress, 0);
      }
    },
    randomValue: randomString,
    emptyValue (): string {
      return '';
    },
    hashValue: hashString,
    equal (valueA: string, valueB: string) {
      return valueA === valueB;
    }
  });

  return InternedString;
}


/**
 * Returns the hash for the given string.
 */
function hashString (input: string): uint32 {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

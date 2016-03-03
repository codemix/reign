/* @flow */

import {forceInline} from "../../performance";
import randomString from "../../random/string";

import type Backing from "backing";
import type {Realm} from "../..";

export const STRING_LENGTH_OFFSET = 0;
export const STRING_HASH_OFFSET = 4;
export const STRING_HEADER_SIZE = 8;
export const STRING_DATA_OFFSET = STRING_HEADER_SIZE;

/**
 * Make a simple string type for the given realm.
 *
 * Strings are length-and-hash-prefixed arrays of characters.
 * If the string is ascii compatible, each character is a Uint8 occupying a single byte.
 * If the string contains non-ascii characters, each character in the string is a Uint16, occupying two bytes.
 * To determine which type of string we're dealing with, we store a negative length for Uint16 arrays and a positive length for Uint8 arrays.
 * The length always refers to the array length and therefore the number of characters, rather than the number of bytes.
 *
 * Strings layout:
 *
 *    ---------------------------------------------
 *    |             Length: Int32                 | (If length is negative, the string is a Uint16 array.)
 *    ---------------------------------------------
 *    |               Hash: Uint32                |
 *    ---------------------------------------------
 *    |   Data: Uint8[](Length)|Uint16[](Length)  |
 *    ---------------------------------------------
 *
 *
 */
export function make (realm: Realm, typeId: uint32): PrimitiveType<string> {
  const {StringType} = realm;
  const RawString = new StringType('String', {
    id: typeId,
    byteLength: 8, // Pointer
    byteAlignment: 8,
    constructor (input) {
      if (this instanceof RawString) {
        throw new TypeError(`String is not a constructor.`);
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
        backing.setFloat64(pointerAddress, createRawString(backing, initialInput));
      }
    },
    store (backing: Backing, pointerAddress: float64, input: string): void {
      const existing: float64 = backing.getFloat64(pointerAddress);
      if (!input) {
        if (existing !== 0) {
          backing.gc.unref(existing);
          backing.setFloat64(pointerAddress, 0);
        }
      }
      else {
        const address: float64 = createRawString(backing, input);
        if (address !== existing) {
          if (existing !== 0) {
            backing.gc.unref(existing);
          }
          backing.setFloat64(pointerAddress, address);
        }
      }
    },
    load (backing: Backing, address: float64): string {
      return getString(backing, backing.getFloat64(address));
    },
    clear (backing: Backing, address: float64): void {
      const existing: float64 = backing.getFloat64(address);
      if (existing !== 0) {
        backing.gc.unref(existing);
        backing.setFloat64(address, 0);
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

  return RawString;
}


/**
 * Store the given raw string and return the address.
 * The string will NOT be interned.
 */
function createRawString (backing: Backing, input: string): float64 {
  let hash = 0x811c9dc5;
  let allAscii = true;
  const length = input.length;
  for (let i = 0; i < length; i++) {
    const code: uint16 = input.charCodeAt(i);
    if (code > 127) {
      allAscii = false;
    }
    hash ^= code;
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  hash = hash >>> 0;
  trace: `Got hash ${hash} for ${allAscii ? 'ascii' : 'multi-byte'} string of ${length} characters.`;
  return storeString(backing, input, hash, allAscii);
}
forceInline(createRawString);


/**
 * Store a string and return its address.
 */
function storeString (backing: Backing, input: string, hash: uint32, allAscii: boolean): float64 {
  if (allAscii) {
    return storeAsciiString(backing, input, hash);
  }
  else {
    return storeMultibyteString(backing, input, hash);
  }
}
forceInline(storeString);

function storeAsciiString (backing: Backing, input: string, hash: uint32): float64 {
  const length = input.length;
  trace: `Storing an ascii string of ${length} character(s): ${JSON.stringify(input)}`;
  const byteLength = length + STRING_HEADER_SIZE;
  const address: float64 = backing.gc.alloc(byteLength, 0, 1);
  backing.setInt32(address, length);
  backing.setUint32(address + STRING_HASH_OFFSET, hash);
  const offset = backing.offsetFor(address + STRING_DATA_OFFSET);
  const chars: Uint8Array = backing.arenaFor(address).uint8Array;
  for (let i = 0; i < length; i++) {
    chars[offset + i] = input.charCodeAt(i);
  }
  return address;
}
forceInline(storeAsciiString);

function storeMultibyteString (backing: Backing, input: string, hash: uint32): float64 {
  const length = input.length;
  const byteLength = length + length + STRING_HEADER_SIZE;
  const address: float64 = backing.gc.alloc(byteLength, 0, 1);
  backing.setInt32(address, -length);
  backing.setUint32(address + STRING_HASH_OFFSET, hash);
  const offset = backing.offsetFor(address + STRING_DATA_OFFSET) >> 1;
  const chars: Uint16Array = backing.arenaFor(address).uint16Array;
  for (let i = 0; i < length; i++) {
    chars[offset + i] = input.charCodeAt(i);
  }
  return address;
}
forceInline(storeMultibyteString);


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
forceInline(hashString);


/**
 * Check that the string stored at the given address matches the given input + hash.
 */
function checkEqual (backing: Backing, address: float64, input: string, hash: uint32, allAscii: boolean): boolean {
  assert: Math.floor(address) === address;
  trace: `Checking address ${address} vs ${input} (${hash}).`;
  if (getStringHash(backing, address) !== hash) {
    trace: `Hash does not match ${hash}.`;
    return false;
  }

  let length = backing.getInt32(address);
  assert: Math.floor(length) === length && Math.abs(length) < Math.pow(2, 31);
  trace: `Got raw string length ${length} ${Math.floor(length)}`;

  if (length < 0) {
    if (allAscii) {
      return false;
    }
    length = -length;
    if (length !== input.length) {
      return false;
    }
    const arena = backing.arenaFor(address);
    const chars: Uint16Array = arena.uint16Array;
    const offset = (backing.offsetFor(address + STRING_HEADER_SIZE)) >> 1;
    for (let i = 0; i < length; i++) {
      if (input.charCodeAt(i) !== chars[offset + i]) {
        return false;
      }
    }
    return true;
  }
  else {
    if (!allAscii) {
      return false;
    }
    else if (length !== input.length) {
      return false;
    }
    const arena = backing.arenaFor(address);
    const chars: Uint8Array = arena.uint8Array;
    const offset = backing.offsetFor(address + STRING_HEADER_SIZE);
    for (let i = 0; i < length; i++) {
      if (input.charCodeAt(i) !== chars[offset + i]) {
        return false;
      }
    }
    return true;
  }
}
forceInline(checkEqual);


/**
 * Read the string at the given address.
 */
function getString (backing: Backing, address: float64): string {
  if (address === 0) {
    return '';
  }
  const arena = backing.arenaFor(address);
  let offset: uint32 = backing.offsetFor(address);

  const length: int32 = arena.int32Array[offset >> 2];
  if (length < 0) {
    offset = (offset + STRING_DATA_OFFSET) >> 1;
    return String.fromCharCode(...arena.uint16Array.slice(offset, offset + Math.abs(length)));
  }
  else {
    offset = (offset + STRING_DATA_OFFSET);
    return String.fromCharCode(...arena.uint8Array.slice(offset, offset + Math.abs(length)));
  }
}
forceInline(getString);


/**
 * Read the hash for the given string.
 */
function getStringHash (backing: Backing, address: float64): uint32 {
  return backing.getUint32(address + STRING_HASH_OFFSET);
}
forceInline(getStringHash);

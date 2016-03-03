/* @flow */

import Backing from "backing";

import {
  $Backing,
  $Address,
} from "../symbols";

import {forceInline} from "../performance";

import type {Realm} from "../";

export type StringPool = {
  size: uint32;
  hash (input: string): uint32;
  get (input: string): float64;
  add (input: string): float64;
  remove (input: string): boolean;
  removeStringByPointer (pointerAddress: float64): boolean;
  has (input: string): boolean;
};


const HEADER_SIZE = 16;
const ARRAY_POINTER_OFFSET = 0;
const ARRAY_LENGTH_OFFSET = 8;
const CARDINALITY_OFFSET = 12;

const INITIAL_BUCKET_COUNT = 4096;

const TYPE_ASCII = 'TYPE_ASCII';
const TYPE_CHAR_ARRAY = 'TYPE_CHAR_ARRAY';

const STRING_LENGTH_OFFSET = 0;
const STRING_HASH_OFFSET = 4;
const STRING_HEADER_SIZE = 8;
const STRING_DATA_OFFSET = STRING_HEADER_SIZE;

type PossibleTypes = 'TYPE_ASCII'|'TYPE_CHAR_ARRAY';


export function make (realm: Realm, poolPointerAddress: float64): StringPool {

  const {TypeClass, StringType, backing} = realm;

  class StringPool {

    constructor (input?: Backing, address?: float64) {
      trace: `Creating string pool.`;
      if (!(input instanceof Backing)) {
        input = backing;
        address = backing.calloc(HEADER_SIZE);
        createPool(backing, address);
      }
      // @flowIssue 252
      this[$Backing] = input;
      // @flowIssue 252
      this[$Address] = address;
    }

    get size (): uint32 {
      // @flowIssue 252
      return getCardinality(this[$Backing], this[$Address]);
    }

    /**
     * Return the hash code for the given string.
     */
    hash (input: string): uint32 {
      return hashString(input);
    }

    /**
     * Gets the address of the given string, if it exists, otherwise 0.
     */
    get (input: string): float64 {
      let hash = 0x811c9dc5;
      let allAscii = true;
      for (let i = 0; i < input.length; i++) {
        const code: uint16 = input.charCodeAt(i);
        if (code > 127) {
          allAscii = false;
        }
        hash ^= code;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      hash = hash >>> 0;
      // @flowIssue 252
      const backing = this[$Backing];
      trace: `Looking up hash ${hash}`;
      // @flowIssue 252
      return lookupString(backing, this[$Address], input, hash, allAscii);
    }

    /**
     * Adds the given string to the pool if it does not already exist, and returns its address.
     * Note that adding a string to the pool will increment the string's reference count by 1.
     */
    add (input: string): float64 {
      trace: `Adding ${input} to the pool.`;
      // @flowIssue 252
      return createString(this[$Backing], this[$Address], ''+input);
    }

    /**
     * Remove the given string from the pool *if* its reference count is 1,
     * otherwise decrement the reference count by one.
     *
     * Returns `true` if the string was actually removed, otherwise `false`.
     */
    remove (input: string): boolean {
      let hash = 0x811c9dc5;
      let allAscii = true;
      for (let i = 0; i < input.length; i++) {
        const code: uint16 = input.charCodeAt(i);
        if (code > 127) {
          allAscii = false;
        }
        hash ^= code;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      hash = hash >>> 0;
      // @flowIssue 252
      return removeString(this[$Backing], this[$Address], input, hash, allAscii);
    }

    /**
     * Remove a string based on the pointer at the given address.
     */
    removeStringByPointer (pointerAddress: float64): boolean {
      // @flowIssue 252
      return removeStringByPointer(this[$Backing], this[$Address], pointerAddress);
    }

    /**
     * Determines whether the given string exists in the pool.
     */
    has (input: string): boolean {
      let hash = 0x811c9dc5;
      let allAscii = true;
      for (let i = 0; i < input.length; i++) {
        const code: uint16 = input.charCodeAt(i);
        if (code > 127) {
          allAscii = false;
        }
        hash ^= code;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      hash = hash >>> 0;
      // @flowIssue 252
      return lookupString(this[$Backing], this[$Address], input, hash, allAscii) !== 0;
    }

  }

  /**
   * Create a string pool at the given address.
   */
  function createPool (backing: Backing, address: float64): void {
    trace: `Creating a new string pool at ${address}.`;
    const pointerArrayLength = INITIAL_BUCKET_COUNT;
    const pointerArrayAddress = backing.calloc(pointerArrayLength * 8);

    setArrayAddress(backing, address, pointerArrayAddress);
    setArrayLength(backing, address, pointerArrayLength);
    setCardinality(backing, address, 0);
  }

  function getArrayAddress (backing: Backing, address: float64): float64 {
    return backing.getFloat64(address);
  }

  function setArrayAddress (backing: Backing, address: float64, value: float64): void {
    backing.setFloat64(address, value);
  }

  function getArrayLength (backing: Backing, address: float64): float64 {
    return backing.getUint32(address + ARRAY_LENGTH_OFFSET);
  }

  function setArrayLength (backing: Backing, address: float64, value: float64): void {
    backing.setUint32(address + ARRAY_LENGTH_OFFSET, value);
  }

  function getCardinality (backing: Backing, address: float64): uint32 {
    return backing.getUint32(address + CARDINALITY_OFFSET);
  }

  function setCardinality (backing: Backing, address: float64, value: uint32): void {
    backing.setUint32(address + CARDINALITY_OFFSET, value);
  }

  /**
   * Read the hash for the given string.
   */
  function getStringHash (backing: Backing, address: float64): uint32 {
    return backing.getUint32(address + STRING_HASH_OFFSET);
  }
  forceInline(getStringHash);

  /**
   * Write the hash for the given string.
   */
  function setStringHash (backing: Backing, address: float64, hash: uint32): void {
    return backing.setUint32(address + STRING_HASH_OFFSET, hash);
  }
  forceInline(setStringHash);


  /**
   * Read the number of characters in the string at the given address.
   */
  function getNumberOfCharacters (backing: Backing, address: float64): uint32 {
    return Math.abs(backing.getInt32(address)); // STRING_LENGTH_OFFSET === 0 so no need to add.
  }
  forceInline(getNumberOfCharacters);


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
   * Store the given string, intern it and return the address.
   * If a string already exists in the pool, the existing string's address
   * will be returned and no duplicate will be created.
   */
  function createString (backing: Backing, poolAddress: float64, input: string): float64 {
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
    return lookupOrInsertString(backing, poolAddress, input, hash, allAscii);
  }
  forceInline(createString);

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
   * Return the appropriate bucket for the given input + hash.
   */
  function probe (backing: Backing, poolAddress: float64, input: string, hash: uint32, allAscii: boolean): float64 {
    const pointerArrayLength = getArrayLength(backing, poolAddress);
    const pointerArrayAddress = getArrayAddress(backing, poolAddress);
    trace: `Probing for hash ${hash}`;
    const arena = backing.arenaFor(pointerArrayAddress);
    const float64Array = arena.float64Array;
    assert: float64Array.length > 0;
    const startOffset = backing.offsetFor(pointerArrayAddress) >> 3;

    let index = (hash & (pointerArrayLength - 1));
    let offset = startOffset + index;
    let address: float64 = 0;
    while ((address = float64Array[offset]) !== 0 && !checkEqual(backing, address, input, hash, allAscii)) {
      index++;
      if (index >= pointerArrayLength) {
        index = 0;
      }
      offset = startOffset + index;
    }
    return arena.startAddress + (offset << 3);
  }
  forceInline(probe);

  /**
   * Find the address of the string for the given input + hash, or 0 if it does not exist.
   */
  function lookupString (backing: Backing, poolAddress: float64, input: string, hash: uint32, allAscii: boolean): float64 {
    return backing.getFloat64(probe(backing, poolAddress, input, hash, allAscii));
  }
  forceInline(lookupString);

  /**
   * Find the address of the string for the given input + hash, or create it if it does not exist.
   */
  function lookupOrInsertString (backing: Backing, poolAddress: float64, input: string, hash: uint32, allAscii: boolean): float64 {
    const pointerAddress: float64 = probe(backing, poolAddress, input, hash, allAscii);
    let address: float64 = backing.getFloat64(pointerAddress);
    if (address !== 0) {
      trace: `String already exists at ${address}, incrementing ref count.`;
      backing.gc.ref(address);
      return address;
    }

    trace: `No entry found for input ${input}, inserting one.`;

    address = storeString(backing, input, hash, allAscii);

    backing.setFloat64(pointerAddress, address);

    const size = getCardinality(backing, poolAddress) + 1;
    setCardinality(backing, poolAddress, size);

    const pointerArrayLength = getArrayLength(backing, poolAddress);
    if (size + (size >> 2) >= pointerArrayLength) {
      trace: `Growing the hash map because we reached >= 80% occupancy.`;
      resize(backing, poolAddress);
    }
    return address;
  }
  forceInline(lookupOrInsertString);

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
   * Remove the given input + hash from the hash map.
   */
  function removeString (backing: Backing, poolAddress: float64, input: string, hash: uint32, allAscii: boolean): boolean {
    let p: float64 = probe(backing, poolAddress, input, hash, allAscii);
    return removeStringByPointer(backing, poolAddress, p);
  }
  forceInline(removeString);


  /**
   * Remove the string at the given address from the hash map.
   */
  function removeStringByPointer (backing: Backing, poolAddress: float64, p: float64): boolean {
    const address = backing.getFloat64(p);

    if (address === 0) {
      // Item does not exist.
      return false;
    }
    if (backing.gc.unref(address) > 0) {
      // Item has other references
      return false;
    }

    const pointerArrayLength = getArrayLength(backing, poolAddress);
    const pointerArrayAddress = getArrayAddress(backing, poolAddress);
    const end = pointerArrayAddress + (pointerArrayLength * 8);

    let q: float64 = p;

    while (true) {
      // Move q to the next entry
      q = q + 8;
      if (q === end) {
        q = pointerArrayAddress;
      }

      const qPointer = backing.getFloat64(q);
      // All entries between p and q have their initial position between p and q
      // and the entry p can be cleared without breaking the search for these
      // entries.
      if (qPointer === 0) {
        break;
      }

      const qHash = getStringHash(backing, qPointer);

      // Find the initial position for the entry at position q.
      const r: float64 = pointerArrayAddress + ((qHash & (pointerArrayLength - 1)) * 8);

      // If the entry at position q has its initial position outside the range
      // between p and q it can be moved forward to position p and will still be
      // found. There is now a new candidate entry for clearing.
      if ((q > p && (r <= p || r > q)) ||
          (q < p && (r <= p && r > q))) {
        backing.copy(p, q, 8);
        p = q;
      }
    }

    // Clear the entry which is allowed to be emptied.
    setStringHash(backing, backing.getFloat64(p), 0);
    setCardinality(backing, poolAddress, getCardinality(backing, poolAddress) - 1);
    return true;
  }
  forceInline(removeStringByPointer);

  function resize (backing: Backing, poolAddress: float64): void {
    const pointerArrayLength = getArrayLength(backing, poolAddress);
    const pointerArrayAddress = getArrayAddress(backing, poolAddress);

    trace: `Resizing string pool to ${pointerArrayLength * 2} buckets.`;
    const newPointerArrayLength = pointerArrayLength * 2;
    const newPointerArrayAddress = backing.calloc(newPointerArrayLength * 8);
    setArrayAddress(backing, poolAddress, newPointerArrayAddress);
    setArrayLength(backing, poolAddress, newPointerArrayLength);

    const newOffset = backing.offsetFor(newPointerArrayAddress) / 8;
    const newPointers = backing.arenaFor(newPointerArrayAddress).float64Array;

    const oldOffset = backing.offsetFor(pointerArrayAddress) / 8;
    const oldPointers = backing.arenaFor(pointerArrayAddress).float64Array;

    for (let oldIndex = 0; oldIndex < pointerArrayLength; oldIndex++) {
      const address = oldPointers[oldOffset + oldIndex];
      if (address === 0) {
        continue;
      }
      const hash: uint32 = getStringHash(backing, address);
      let targetIndex = (hash & (newPointerArrayLength - 1));
      let offset = newOffset + targetIndex;
      let pointer = 0;
      while (newPointers[offset] !== 0) {
        targetIndex++;
        if (targetIndex >= newPointerArrayLength) {
          targetIndex = 0;
        }
        offset = newOffset + targetIndex;
      }
      newPointers[offset] = address;
    }

    backing.free(pointerArrayAddress);
  }

  {
    const address = backing.getFloat64(poolPointerAddress);
    if (address === 0) {
      trace: `Found no existing string pool, creating a new one.`;
      const pool = new StringPool();
      // @flowIssue 252
      backing.setFloat64(poolPointerAddress, pool[$Address]);
      return pool;
    }
    else {
      trace: `Loading an existing string pool from ${address}.`;
      return new StringPool(backing, address);
    }
  }
}


function randomAsciiString (): string {
  const length: uint32 = Math.floor(Math.random() * 255);
  const chars: uint8[] = new Array(length);
  let seed = Math.round(Math.random() * 100000);

  for (let i = 0; i < length; i++) {
    seed = (seed + (i * 333)) % 127;
    if (seed < 32) {
      seed += 32;
    }
    chars[i] = seed;
  }

  return String.fromCharCode(...chars);
}


function randomMultiByteString (): string {
  const length: uint32 = Math.floor(Math.random() * 255);
  const chars: uint16[] = new Array(length);
  let seed = Math.round(Math.random() * 100000);

  for (let i = 0; i < length; i++) {
    seed = (seed + (i * 333)) % 512;
    if (seed < 32) {
      seed += 32;
    }
    chars[i] = seed;
  }

  return String.fromCharCode(...chars);
}
/* @flow */

import Backing from "backing";
import {TypedObject} from "../";

import type {Realm} from "../../";

import {
  $Backing,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences,
  $ElementType,
  $GetElement,
  $SetElement
} from "../../symbols";

export type ForEachVisitor = (element: any, index: uint32, context: HashMap) => void;
export type MapVisitor = (element: any, index: uint32, context: HashMap) => any;
export type FilterVisitor = (element: any, index: uint32, context: HashMap) => boolean;

export class HashMap<K, V> extends TypedObject {

  /**
   * Return the size of the hash map.
   */
  get size (): uint32 {
    return this[$Backing].getUint32(this[$Address] + 8);
  }

  /**
   * Get the value associated with the given key, otherwise undefined.
   */
  get (key: K): ?V {
    return undefined;
  }

  /**
   * Set the value associated with the given key.
   */
  set (key: K): HashMap<K, V> {
    return this;
  }

  /**
   * Determine whether the hash map contains the given key or not.
   */
  has (key: K): boolean {
    return false;
  }

}

const HEADER_SIZE = 16;
const ARRAY_POINTER_OFFSET = 0;
const ARRAY_LENGTH_OFFSET = 8;
const CARDINALITY_OFFSET = 12;

const INITIAL_BUCKET_COUNT = 16;


/**
 * Makes a HashMapType type class for the given realm.
 */
export function make ({TypeClass, StructType, ReferenceType, T, backing}: Realm): TypeClass<HashMap<any, any>> {
  return new TypeClass('HashMapType', (KeyType: Type<any>, ValueType: Type<any>): (Partial: Function) => Object => {
    return (Partial: Function) => {
      const canContainReferences = KeyType[$CanContainReferences] || ValueType[$CanContainReferences];
      Partial[$CanBeEmbedded] = true;
      Partial[$CanBeReferenced] = true;
      Partial[$CanContainReferences] = canContainReferences;

      const name = `HashMap<${KeyType.name}, ${ValueType.name}>`;

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

      const Bucket = new StructType(`HashMapBucket<${KeyType.name}, ${ValueType.name}>`, [
        ['hash', T.Uint32],
        ['key', KeyType],
        ['value', ValueType]
      ]);

      const KEY_OFFSET = Bucket.fieldOffsets.key;
      const VALUE_OFFSET = Bucket.fieldOffsets.value;


      const BUCKET_SIZE = Bucket.byteLength;

      function getBucketHash (backing: Backing, bucketAddress: float64): uint32 {
        return backing.getUint32(bucketAddress);
      }

      function setBucketHash (backing: Backing, bucketAddress: float64, value: uint32): void {
        backing.setUint32(bucketAddress, value);
      }

      function getBucketKey (backing: Backing, bucketAddress: float64): any {
        return KeyType.load(heap, bucketAddress + KEY_OFFSET);
      }

      function setBucketKey (backing: Backing, bucketAddress: float64, value: any) {
        return KeyType.store(backing, bucketAddress + KEY_OFFSET, value);
      }

      function getBucketValue (backing: Backing, bucketAddress: float64): any {
        return ValueType.load(backing, bucketAddress + VALUE_OFFSET);
      }

      function setBucketValue (backing: Backing, bucketAddress: float64, value: any) {
        return ValueType.store(backing, bucketAddress + VALUE_OFFSET, value);
      }

      /**
       * The constructor for this kind of hash map.
       */
      function constructor (backingOrInput: ?Backing|Object, address?: float64) {
        if (backingOrInput instanceof Backing) {
          this[$Backing] = backingOrInput;
          this[$Address] = address;
        }
        else {
          this[$Backing] = backing;
          this[$Address] = createHashMap(backing, backingOrInput);
        }
      }

      /**
       * Create a new hash map from the given input and return its address.
       */
      function createHashMap (backing: Backing, input: ?Map|HashMap|Array<[KeyType, ValueType]>|Object): float64 {

        // Allocate space for the header.
        const address = backing.gc.calloc(HEADER_SIZE);

        if (input == null) {
          createEmptyHashMap(backing, address);
        }
        else if (typeof input !== 'object') {
          throw new TypeError(`Cannot create a ${name} from invalid input.`);
        }
        else if (Array.isArray(input)) {
          createHashMapFromArray(backing, address, input);
        }
        else if (typeof input[Symbol.iterator] === 'function') {
          createHashMapFromIterable(backing, address, input);
        }
        else {
          createHashMapFromObject(backing, address, input);
        }

        return address;
      }

      /**
       * Create an empty hashmap with a bucket array.
       * Use `initialCardinalityHint` to pre-allocate a bucket array which can
       * handle at least the given number of entries. Note that specifying this
       * argument does not actually write the cardinality value.
       */
      function createEmptyHashMap (backing: Backing, address: float64, initialCardinalityHint: uint32 = 0): float64 {
        let initialSize;
        if ((initialCardinalityHint * 2) < INITIAL_BUCKET_COUNT) {
           initialSize = INITIAL_BUCKET_COUNT;
        }
        else {
          initialSize = initialCardinalityHint * 2;
        }
        const body = backing.calloc(initialSize * Bucket.byteLength);
        setArrayAddress(backing, address, body);
        setArrayLength(backing, address, initialSize);
        return address;
      }

      /**
       * Create a hashmap from an array of key / values.
       */
      function createHashMapFromArray (backing: Backing, address: float64, input: Array<[KeyType, ValueType]>): float64 {
        const length = input.length;
        createEmptyHashMap(backing, address, length);
        for (let i = 0; i < length; i++) {
          const [key, value] = input[i];
        }
      }

      /**
       * Create a hashmap from an iterable.
       */
      function createHashMapFromIterable (backing: Backing, address: float64, input: Iterable<[KeyType, ValueType]>): float64 {

      }

      /**
       * Create a hashmap from an object.
       */
      function createHashMapFromObject (backing: Backing, address: float64, input: Object): float64 {

      }

      /**
       * Return the appropriate bucket for the given key + hash.
       */
      function probe (backing: Backing, header: float64, key: any, hash: uint32): float64 {
        const bucketArrayLength = getArrayLength(backing, header);
        const bucketArrayAddress = getArrayAddress(backing, header);

        let index = (hash & (bucketArrayLength - 1));
        let address: float64 = bucketArrayAddress + (index * BUCKET_SIZE);
        let bucketHash = getBucketHash(backing, address);

        while (bucketHash !== 0 && (bucketHash !== hash || !KeyType.equal(key, getBucketKey(backing, address)))) {
          index++;
          if (index >= bucketArrayLength) {
            index = 0;
          }
          address = bucketArrayAddress + (index * BUCKET_SIZE);
          bucketHash = getBucketHash(backing, address);
        }
        return address;
      }

      /**
       * Find the address of the bucket for the given key + hash, or 0 if it does not exist.
       */
      function lookup (backing: Backing, header: float64, key: any, hash: uint32): float64 {
        const address: float64 = probe(backing, header, key, hash);
        return getBucketHash(backing, address) === 0 ? 0 : address;
      }

      /**
       * Find the address of the bucket for the given key + hash, or create it if it does not exist.
       */
      function lookupOrInsert (backing: Backing, header: float64, key: any, hash: uint32): float64 {
        const bucketArrayLength = getArrayLength(backing, header);
        const address: float64 = probe(backing, header, key, hash);
        if (getBucketHash(backing, address) !== 0) {
          return address;
        }

        trace: `No entry found for key ${key}, inserting one.`;

        setBucketKey(backing, address, key);
        setBucketHash(backing, address, hash);

        const cardinality = getCardinality(backing, header) + 1;
        setCardinality(backing, header, cardinality);
        if (cardinality + (cardinality >> 2) >= bucketArrayLength) {
          trace: `Growing the hash map because we reached >= 80% occupancy.`;
          resize(backing, header);
          return probe(backing, header, key, hash);
        }
        else {
          return address;
        }
      }

      /**
       * Remove the given key + hash from the hash map.
       */
      function remove (backing: Backing, header: float64, key: any, hash: uint32): boolean {
        let p: float64 = probe(backing, header, key, hash);
        if (getBucketHash(backing, p) === 0) {
          return false;
        }

        const bucketArrayLength = getArrayLength(backing, header);
        const bucketArrayAddress = getArrayAddress(backing, header);
        const end = bucketArrayAddress + (bucketArrayLength * BUCKET_SIZE);
        // @fixme free the bucket value?

        let q: float64 = p;

        while (true) {
          // Move q to the next entry
          q = q + BUCKET_SIZE;
          if (q === end) {
            q = bucketArrayAddress;
          }

          const qHash = getBucketHash(backing, q);
          // All entries between p and q have their initial position between p and q
          // and the entry p can be cleared without breaking the search for these
          // entries.
          if (qHash === 0) {
            break;
          }

          // Find the initial position for the entry at position q.
          const r: float64 = bucketArrayAddress + ((qHash & (bucketArrayLength - 1)) * BUCKET_SIZE);

          // If the entry at position q has its initial position outside the range
          // between p and q it can be moved forward to position p and will still be
          // found. There is now a new candidate entry for clearing.
          if ((q > p && (r <= p || r > q)) ||
              (q < p && (r <= p && r > q))) {
            backing.copy(p, q, BUCKET_SIZE);
            p = q;
          }
        }

        // Clear the entry which is allowed to en emptied.
        setBucketHash(backing, p, 0);
        const cardinality = getCardinality(backing, header);
        assert: cardinality > 0;
        setCardinality(backing, header, cardinality - 1);
        return true;
      }

      function resize (backing: Backing, header: float64): void {
        const bucketArrayLength = getArrayLength(backing, header);
        const bucketArrayAddress = getArrayAddress(backing, header);
        const cardinality = getCardinality(backing, header);

        const newBuckets = new BucketArray();

        hashmap.bucketArrayAddress = newBuckets[$address];
        hashmap.bucketArrayLength = newBuckets.length;
        hashmap.size = 1;


        for (let index = 0; index < bucketArrayLength; index++) {
          const oldAddress = bucketArrayAddress + (index * BUCKET_SIZE);
          const bucketHash = getBucketHash(backing, oldAddress);
          if (bucketHash !== 0) {
            trace: `Copying key ${getBucketKey(backing, oldAddress)} ${bucketHash}`;
            const newAddress = lookupOrInsert(backing, header, getBucketKey(backing, oldAddress), bucketHash);
            setBucketValue(backing, newAddress, getBucketValue(backing, oldAddress));
          }
        }

        hashmap.size = size;

        backing.free(bucketArrayAddress);
      }

      const prototype = Object.create(HashMap.prototype);



      return {
        name,
        constructor,
        prototype
      };
    };
  });
}
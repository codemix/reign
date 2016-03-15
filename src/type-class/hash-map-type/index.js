/* @flow */

import Backing from "backing";
import {TypedObject} from "../";

import type {Realm} from "../../";
import {alignTo} from "../../util";

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
    // @flowIssue 252
    return this[$Backing].getUint32(this[$Address] + CARDINALITY_OFFSET);
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

  /**
   * Deletes a key from the hash map.
   * Returns `true` if the given key was deleted, otherwise `false`.
   */
  delete (key: K): boolean {
    return false;
  }

}

const HEADER_SIZE = 16;
const ARRAY_POINTER_OFFSET = 0;
const ARRAY_LENGTH_OFFSET = 8;
const CARDINALITY_OFFSET = 12;

const INITIAL_BUCKET_COUNT = 16;

export const MIN_TYPE_ID = Math.pow(2, 20) * 6;


/**
 * Makes a HashMapType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<HashMapType<Type, Type>> {
  const {TypeClass, StructType, T, backing} = realm;
  let typeCounter = 0;
  return new TypeClass('HashMapType', (KeyType: Type, ValueType: Type, config: Object = {}): Function => {
    return (Partial: Function) => {

      const name = typeof config.name === 'string' ? config.name : `HashMap<${KeyType.name}, ${ValueType.name}>`;
      if (realm.T[name]) {
        return realm.T[name];
      }

      typeCounter++;
      const id = typeof config.id === 'number' ? config.id : MIN_TYPE_ID + typeCounter;

      type AcceptableInput = Map|TypedHashMap<KeyType, ValueType>|Array<[KeyType, ValueType]>|Object;

      Partial[$CanBeEmbedded] = false;
      Partial[$CanBeReferenced] = true;
      Partial[$CanContainReferences] = true;

      Object.defineProperties(Partial, {
        id: {
          value: id,
        },
        name: {
          value: name
        }
      });

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

      const Bucket = new StructType([
        ['hash', T.Uint32],
        ['key', KeyType],
        ['value', ValueType]
      ]);

      const KEY_OFFSET = Bucket.fieldOffsets.key;
      const VALUE_OFFSET = Bucket.fieldOffsets.value;

      const BUCKET_SIZE = alignTo(Bucket.byteLength, Bucket.byteAlignment);

      function getBucketHash (backing: Backing, bucketAddress: float64): uint32 {
        return backing.getUint32(bucketAddress);
      }

      function setBucketHash (backing: Backing, bucketAddress: float64, value: uint32): void {
        backing.setUint32(bucketAddress, value);
      }

      function getBucketKey (backing: Backing, bucketAddress: float64): any {
        return KeyType.load(backing, bucketAddress + KEY_OFFSET);
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
          this[$Address] = createHashMapAt(backing, backing.gc.calloc(HEADER_SIZE, id), backingOrInput);
        }
        this[$CanBeReferenced] = true;
      }

      /**
       * Create a new hash map from the given input and return its address.
       */
      function createHashMapAt (backing: Backing, address: float64, input: ?AcceptableInput): float64 {
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
      function createEmptyHashMap (backing: Backing, header: float64, initialCardinalityHint: uint32 = 0): float64 {
        let initialSize;
        if ((initialCardinalityHint * 2) < INITIAL_BUCKET_COUNT) {
           initialSize = INITIAL_BUCKET_COUNT;
        }
        else {
          initialSize = initialCardinalityHint * 2;
        }
        const body = backing.calloc(initialSize * BUCKET_SIZE);
        setArrayAddress(backing, header, body);
        setArrayLength(backing, header, initialSize);
        return header;
      }

      /**
       * Create a hashmap from an array of key / values.
       */
      function createHashMapFromArray (backing: Backing, header: float64, input: Array<[KeyType, ValueType]>): void {
        const length = input.length;
        createEmptyHashMap(backing, header, length);
        for (let i = 0; i < length; i++) {
          const [key, value] = input[i];
          const hash: uint32 = KeyType.hashValue((key: any));
          setBucketValue(backing, lookupOrInsert(backing, header, key, hash), value);
        }
      }

      /**
       * Create a hashmap from an iterable.
       */
      function createHashMapFromIterable (backing: Backing, header: float64, input: Iterable<[KeyType, ValueType]>): void {
        createEmptyHashMap(backing, header);
        for (const [key, value] of input) {
          const hash: uint32 = KeyType.hashValue((key: any));
          setBucketValue(backing, lookupOrInsert(backing, header, key, hash), value);
        }
      }

      /**
       * Create a hashmap from an object.
       */
      function createHashMapFromObject (backing: Backing, header: float64, input: Object): void {
        const keys = Object.keys(input);
        const length = keys.length;
        createEmptyHashMap(backing, header, length);
        for (let i = 0; i < length; i++) {
          const key = keys[i];
          const value = input[key];
          const hash: uint32 = KeyType.hashValue((key: any));
          setBucketValue(backing, lookupOrInsert(backing, header, key, hash), value);
        }
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
          grow(backing, header);
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

      /**
       * Grow the backing array to twice its current capacity.
       */
      function grow (backing: Backing, header: float64): void {
        const bucketArrayLength = getArrayLength(backing, header);
        const bucketArrayAddress = getArrayAddress(backing, header);
        const cardinality = getCardinality(backing, header);

        const newBuckets = backing.calloc(bucketArrayLength * 2 * BUCKET_SIZE);
        setArrayAddress(backing, header, newBuckets);
        setArrayLength(backing, header, bucketArrayLength * 2);

        setCardinality(backing, header, 1);

        for (let index = 0; index < bucketArrayLength; index++) {
          const oldAddress = bucketArrayAddress + (index * BUCKET_SIZE);
          const bucketHash = getBucketHash(backing, oldAddress);
          if (bucketHash !== 0) {
            trace: `Copying key ${getBucketKey(backing, oldAddress)} ${bucketHash}`;
            const newAddress = lookupOrInsert(backing, header, getBucketKey(backing, oldAddress), bucketHash);
            setBucketValue(backing, newAddress, getBucketValue(backing, oldAddress));
          }
        }

        setCardinality(backing, header, cardinality);

        backing.free(bucketArrayAddress);
      }

      /**
       * Destroy the hashmap at the given address, along with all its contents.
       */
      function destructor (backing: Backing, header: float64): void {
        const bucketArrayAddress = getArrayAddress(backing, header);
        if (bucketArrayAddress !== 0) {
          const bucketArrayLength = getArrayLength(backing, header);
          setArrayAddress(backing, header, 0);
          setArrayLength(backing, header, 0);
          let current = bucketArrayAddress;
          for (let index = 0; index < bucketArrayLength; index++) {
            Bucket.clear(backing, current);
            current += BUCKET_SIZE;
          }
          backing.free(bucketArrayAddress);
        }
      }

      const prototype = Object.create(HashMap.prototype, {
        /**
         * Get the value associated with the given key, otherwise undefined.
         */
        get: {
          value (key: KeyType): ?ValueType {
            const hash: uint32 = KeyType.hashValue((key: any));
            const backing: Backing = this[$Backing];
            const address: float64 = lookup(backing, this[$Address] , key, hash);
            if (address === 0) {
              return undefined;
            }
            else {
              return getBucketValue(backing, address);
            }
          }
        },

        /**
         * Set the value associated with the given key.
         */
        set: {
          value (key: KeyType, value: ValueType): HashMap<KeyType, ValueType> {
            const hash: uint32 = KeyType.hashValue((key: any));
            const backing: Backing = this[$Backing];
            const address: float64 = lookupOrInsert(backing, this[$Address], key, hash);
            setBucketValue(backing, address, value);
            return this;
          }
        },

        /**
         * Determine whether the hash map contains the given key or not.
         */
        has: {
          value (key: KeyType): boolean {
            const hash: uint32 = KeyType.hashValue((key: any));
            return lookup(this[$Backing], this[$Address], key, hash) !== 0;
          }
        },
        /**
         * Deletes a key from the hash map.
         * Returns `true` if the given key was deleted, otherwise `false`.
         */
        delete: {
          value (key: KeyType): boolean {
            const hash: uint32 = KeyType.hashValue((key: any));
            return remove(this[$Backing], this[$Address], key, hash);
          }
        },

        /**
         * Return a representation of the hash map which can be encoded as JSON.
         */
        toJSON: {
          value (): [KeyType, ValueType][] {
            const backing = this[$Backing];
            const address = this[$Address];
            const size = getCardinality(backing, address);
            const bucketArrayLength = getArrayLength(backing, address);
            const arr = new Array(size);
            let current: float64 = getArrayAddress(backing, address);
            let index: uint32 = 0;
            for (let i = 0; i < bucketArrayLength; i++) {
              if (getBucketHash(backing, current) !== 0) {
                arr[index++] = [getBucketKey(backing, current), getBucketValue(backing, current)];
              }
              current += BUCKET_SIZE;
            }

            return arr;
          }
        },


        /**
         * Iterate the key / values in the map.
         * IMPORTANT: The iteration order is not stable and should not be relied on!
         * It is guaranteed that every entry will be yielded exactly once, but the order
         * depends on the hashed value and the size of the backing array.
         * If you need ordered iteration, use a SkipListMap.
         */
        [Symbol.iterator]: {
          *value () {
            let backing = this[$Backing];
            let address = this[$Address];
            let bucketArrayLength = getArrayLength(backing, address);
            let current: float64 = getArrayAddress(backing, address);
            for (let index = 0; index < bucketArrayLength; index++) {
              if (getBucketHash(backing, current) !== 0) {
                yield [getBucketKey(backing, current), getBucketValue(backing, current)];
              }
              current += BUCKET_SIZE;
            }
          }
        }
      });



      return {
        id,
        name,
        byteLength: 8,
        byteAlignment: 8,
        constructor,
        prototype,
        accepts (input: any): boolean {
          return input !== null && typeof input === 'object';
        },
        initialize (backing: Backing, pointerAddress: float64, initialValue?: AcceptableInput): void {
          const address = backing.gc.calloc(HEADER_SIZE, Partial.id, 1);
          createHashMapAt(backing, address, initialValue);
          backing.setFloat64(pointerAddress, address);
        },
        store (backing: Backing, pointerAddress: float64, input?: AcceptableInput): void {
          const existing = backing.getFloat64(pointerAddress);
          if (existing !== 0) {
            backing.setFloat64(pointerAddress, 0);
            backing.gc.unref(existing);
          }
          const address = backing.gc.calloc(HEADER_SIZE, Partial.id, 1);
          createHashMapAt(backing, address, input);
          backing.setFloat64(pointerAddress, address);
        },
        load (backing: Backing, pointerAddress: float64): ?Partial {
          const address = backing.getFloat64(pointerAddress);
          return address === 0 ? null : new Partial(backing, address);
        },
        clear (backing: Backing, pointerAddress: float64) {
          const address = backing.getFloat64(pointerAddress);
          if (address !== 0) {
            backing.setFloat64(pointerAddress, 0);
            backing.gc.unref(address);
          }
        },
        destructor: destructor,
        equal (mapA: TypedHashMap<KeyType, ValueType>, mapB: TypedHashMap<KeyType, ValueType>): boolean {
          if (mapA[$Backing] === mapB[$Backing] && mapA[$Address] === mapB[$Address]) {
            return true;
          }
          else if (mapA[size] !== mapB[size]) {
            return false;
          }

          for (const [key, a] of mapA) {
            const b = mapB.get(key);
            if (a !== b && (b === undefined || !ValueType.equal(a, b))) {
              return false;
            }
          }
          return true;
        },
        randomValue (): TypedHashMap<KeyType, ValueType> {
          const map = new Partial();
          const size = Math.ceil(Math.random() * 32);
          for (let i = 0; i < size; i++) {
            map.set(KeyType.randomValue(), ValueType.randomValue());
          }
          return map;
        },
        emptyValue (): Partial {
          return new Partial();
        },
        flowType () {
          return `HashMap<${KeyType.flowType()}, ${ValueType.flowType()}>`;
        }
      };
    };
  });
}

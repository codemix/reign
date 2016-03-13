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

export type ForEachVisitor = (element: any, index: uint32, context: HashSet) => void;
export type MapVisitor = (element: any, index: uint32, context: HashSet) => any;
export type FilterVisitor = (element: any, index: uint32, context: HashSet) => boolean;

export class HashSet<E> extends TypedObject {

  /**
   * Return the size of the hash set.
   */
  get size (): uint32 {
    // @flowIssue 252
    return this[$Backing].getUint32(this[$Address] + CARDINALITY_OFFSET);
  }

  /**
   * Add the given entry to the set if it does not already exist.
   */
  add (entry: E): HashSet<E> {
    return this;
  }

  /**
   * Determine whether the hash set contains the given entry or not.
   */
  has (entry: E): boolean {
    return false;
  }

  /**
   * Deletes an entry from the hash set.
   * Returns `true` if the given entry was deleted, otherwise `false`.
   */
  delete (entry: E): boolean {
    return false;
  }

}

const HEADER_SIZE = 16;
const ARRAY_POINTER_OFFSET = 0;
const ARRAY_LENGTH_OFFSET = 8;
const CARDINALITY_OFFSET = 12;

const INITIAL_BUCKET_COUNT = 16;

export const MIN_TYPE_ID = Math.pow(2, 20) * 7;


/**
 * Makes a HashSetType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<HashSetType<Type, Type>> {
  const {TypeClass, StructType, ReferenceType, T, backing} = realm;
  let typeCounter = 0;
  return new TypeClass('HashSetType', (EntryType: Type, config: Object = {}): Function => {
    return (Partial: Function) => {

      const name = typeof config.name === 'string' ? config.name : `HashSet<${EntryType.name}>`;
      if (realm.T[name]) {
        return realm.T[name];
      }

      typeCounter++;
      const id = typeof config.id === 'number' ? config.id : MIN_TYPE_ID + typeCounter;

      type AcceptableInput = Set|TypedHashSet<EntryType>|EntryType|Object;

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

      Partial.ref = new ReferenceType(Partial);

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
        ['entry', EntryType]
      ]);

      const ENTRY_OFFSET = Bucket.fieldOffsets.entry;

      const BUCKET_SIZE = alignTo(Bucket.byteLength, Bucket.byteAlignment);

      function getBucketHash (backing: Backing, bucketAddress: float64): uint32 {
        return backing.getUint32(bucketAddress);
      }

      function setBucketHash (backing: Backing, bucketAddress: float64, value: uint32): void {
        backing.setUint32(bucketAddress, value);
      }

      function getBucketEntry (backing: Backing, bucketAddress: float64): any {
        return EntryType.load(backing, bucketAddress + ENTRY_OFFSET);
      }

      function setBucketEntry (backing: Backing, bucketAddress: float64, value: any) {
        return EntryType.store(backing, bucketAddress + ENTRY_OFFSET, value);
      }

      /**
       * The constructor for this kind of hash set.
       */
      function constructor (backingOrInput: ?Backing|AcceptableInput, address?: float64) {
        if (backingOrInput instanceof Backing) {
          this[$Backing] = backingOrInput;
          this[$Address] = address;
        }
        else {
          this[$Backing] = backing;
          this[$Address] = createHashSetAt(backing, backing.gc.calloc(HEADER_SIZE, id), backingOrInput);
        }
        this[$CanBeReferenced] = true;
      }

      /**
       * Create a new hash set from the given input and return its address.
       */
      function createHashSetAt (backing: Backing, address: float64, input: ?AcceptableInput): float64 {
        if (input == null) {
          createEmptyHashSet(backing, address);
        }
        else if (Array.isArray(input)) {
          createHashSetFromArray(backing, address, input);
        }
        // @flowIssue 252
        else if (typeof input[Symbol.iterator] === 'function') {
          createHashSetFromIterable(backing, address, input);
        }
        else {
          throw new TypeError(`Cannot create a ${name} from invalid input.`);
        }

        return address;
      }

      /**
       * Create an empty hashset with a bucket array.
       * Use `initialCardinalityHint` to pre-allocate a bucket array which can
       * handle at least the given number of entries. Note that specifying this
       * argument does not actually write the cardinality value.
       */
      function createEmptyHashSet (backing: Backing, header: float64, initialCardinalityHint: uint32 = 0): float64 {
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
       * Create a hashset from an array of entries.
       */
      function createHashSetFromArray (backing: Backing, header: float64, input: Array<EntryType>): void {
        const length = input.length;
        createEmptyHashSet(backing, header, length);
        for (let i = 0; i < length; i++) {
          const entry = input[i];
          const hash: uint32 = EntryType.hashValue((entry: any));
          lookupOrInsert(backing, header, entry, hash);
        }
      }

      /**
       * Create a hashset from an iterable.
       */
      function createHashSetFromIterable (backing: Backing, header: float64, input: $Fixme<Iterable<EntryType>>): void {
        createEmptyHashSet(backing, header);
        for (const entry of input) {
          const hash: uint32 = EntryType.hashValue((entry: any));
          lookupOrInsert(backing, header, entry, hash);
        }
      }

      /**
       * Return the appropriate bucket for the given entry + hash.
       */
      function probe (backing: Backing, header: float64, entry: any, hash: uint32): float64 {
        const bucketArrayLength = getArrayLength(backing, header);
        const bucketArrayAddress = getArrayAddress(backing, header);

        let index = (hash & (bucketArrayLength - 1));
        let address: float64 = bucketArrayAddress + (index * BUCKET_SIZE);
        let bucketHash = getBucketHash(backing, address);

        while (bucketHash !== 0 && (bucketHash !== hash || !EntryType.equal(entry, getBucketEntry(backing, address)))) {
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
       * Find the address of the bucket for the given entry + hash, or 0 if it does not exist.
       */
      function lookup (backing: Backing, header: float64, entry: any, hash: uint32): float64 {
        const address: float64 = probe(backing, header, entry, hash);
        return getBucketHash(backing, address) === 0 ? 0 : address;
      }

      /**
       * Find the address of the bucket for the given entry + hash, or create it if it does not exist.
       */
      function lookupOrInsert (backing: Backing, header: float64, entry: any, hash: uint32): float64 {
        const bucketArrayLength = getArrayLength(backing, header);
        const address: float64 = probe(backing, header, entry, hash);
        if (getBucketHash(backing, address) !== 0) {
          return address;
        }

        trace: `No entry found for entry ${entry}, inserting one.`;

        setBucketEntry(backing, address, entry);
        setBucketHash(backing, address, hash);

        const cardinality = getCardinality(backing, header) + 1;
        setCardinality(backing, header, cardinality);
        if (cardinality + (cardinality >> 2) >= bucketArrayLength) {
          trace: `Growing the hash set because we reached >= 80% occupancy.`;
          grow(backing, header);
          return probe(backing, header, entry, hash);
        }
        else {
          return address;
        }
      }

      /**
       * Remove the given entry + hash from the hash set.
       */
      function remove (backing: Backing, header: float64, entry: any, hash: uint32): boolean {
        let p: float64 = probe(backing, header, entry, hash);
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
            trace: `Copying entry ${getBucketEntry(backing, oldAddress)} ${bucketHash}`;
            lookupOrInsert(backing, header, getBucketEntry(backing, oldAddress), bucketHash);
          }
        }

        setCardinality(backing, header, cardinality);

        backing.free(bucketArrayAddress);
      }

      /**
       * Destroy the hashset at the given address, along with all its contents.
       */
      function destructor (backing: Backing, header: float64): void {
        const bucketArrayAddress = getArrayAddress(backing, header);
        if (bucketArrayAddress !== 0) {
          const bucketArrayLength = getArrayLength(backing, header);
          let current = bucketArrayAddress;
          for (let index = 0; index < bucketArrayLength; index++) {
            Bucket.destructor(backing, current);
            current += BUCKET_SIZE;
          }
          setArrayAddress(backing, header, 0);
          setArrayLength(backing, header, 0);
          backing.free(bucketArrayAddress);
        }
      }

      const prototype = Object.create(HashSet.prototype, {

        /**
         * Add the given entry to the hash set.
         */
        add: {
          value (entry: EntryType): HashSet<EntryType> {
            const hash: uint32 = EntryType.hashValue((entry: any));
            lookupOrInsert(this[$Backing], this[$Address], entry, hash);
            return this;
          }
        },

        /**
         * Determine whether the hash set contains the given entry or not.
         */
        has: {
          value (entry: EntryType): boolean {
            const hash: uint32 = EntryType.hashValue((entry: any));
            return lookup(this[$Backing], this[$Address], entry, hash) !== 0;
          }
        },
        /**
         * Deletes an entry from the hash set.
         * Returns `true` if the given entry was deleted, otherwise `false`.
         */
        delete: {
          value (entry: EntryType): boolean {
            const hash: uint32 = EntryType.hashValue((entry: any));
            return remove(this[$Backing], this[$Address], entry, hash);
          }
        },

        /**
         * Return a representation of the hash set which can be encoded as JSON.
         */
        toJSON: {
          value (): EntryType[] {
            const backing = this[$Backing];
            const address = this[$Address];
            const size = getCardinality(backing, address);
            const bucketArrayLength = getArrayLength(backing, address);
            const arr = new Array(size);
            let current: float64 = getArrayAddress(backing, address);
            let index: uint32 = 0;
            for (let i = 0; i < bucketArrayLength; i++) {
              if (getBucketHash(backing, current) !== 0) {
                arr[index++] = getBucketEntry(backing, current);
              }
              current += BUCKET_SIZE;
            }

            return arr;
          }
        },


        /**
         * Iterate the key / values in the set.
         * IMPORTANT: The iteration order is not stable and should not be relied on!
         * It is guaranteed that every entry will be yielded exactly once, but the order
         * depends on the hashed value and the size of the backing array.
         * If you need ordered iteration, use a SkipListSet.
         */
        [Symbol.iterator]: {
          *value () {
            let backing = this[$Backing];
            let address = this[$Address];
            let bucketArrayLength = getArrayLength(backing, address);
            let current: float64 = getArrayAddress(backing, address);
            for (let index = 0; index < bucketArrayLength; index++) {
              if (getBucketHash(backing, current) !== 0) {
                yield getBucketEntry(backing, current);
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
          const address = backing.gc.alloc(HEADER_SIZE, Partial.id, 1);
          createHashSetAt(backing, address, initialValue);
          backing.setFloat64(pointerAddress, address);
        },
        store (backing: Backing, pointerAddress: float64, input?: AcceptableInput): void {
          const existing = backing.getFloat64(pointerAddress);
          if (existing !== 0) {
            backing.setFloat64(pointerAddress, 0);
            backing.gc.unref(existing);
          }
          const address = backing.gc.alloc(HEADER_SIZE, Partial.id, 1);
          createHashSetAt(backing, address, input);
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
        randomValue (): TypedHashSet<EntryType> {
          const set = new Partial();
          const size = Math.ceil(Math.random() * 32);
          for (let i = 0; i < size; i++) {
            set.add(EntryType.randomValue());
          }
          return set;
        },
        emptyValue (): Partial {
          return new Partial();
        },
        flowType () {
          return `HashSet<${EntryType.flowType()}>`;
        }
      };
    };
  });
}


/**
 * Ensure that the given value is aligned to the given number of bytes.
 */
export function alignTo (value: number, numberOfBytes: number): number {
  const rem = value % numberOfBytes;
  return rem === 0 ? value : value + (numberOfBytes - rem);
}
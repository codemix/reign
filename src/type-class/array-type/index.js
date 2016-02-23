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

export type ForEachVisitor = (element: any, index: uint32, context: TypedArray) => void;
export type MapVisitor = (element: any, index: uint32, context: TypedArray) => any;
export type FilterVisitor = (element: any, index: uint32, context: TypedArray) => boolean;

export class TypedArray extends TypedObject {

  /**
   * Return the length of the array.
   */
  get length (): uint32 {
    return this[$Backing].getUint32(this[$Address] + 8);
  }

  /**
   * Visit every item in the typed array.
   */
  forEach (visitor: ForEachVisitor): TypedArray {
    const ElementType = this[$ElementType];
    const backing = this[$Backing];
    const address = this[$Address];
    const length = backing.getUint32(address + 8);
    let current = backing.getFloat64(address);
    for (let i = 0; i < length; i++) {
      visitor(ElementType.load(backing, current), i, this);
      current += ElementType.byteLength;
    }
    return this;
  }

  /**
   * Map over every item in the typed array and return a new `Array` containing the result.
   */
  map (visitor: MapVisitor): Array<any> {
    const ElementType = this[$ElementType];
    const backing = this[$Backing];
    const address = this[$Address];
    const length = backing.getUint32(address + 8);
    const array = new Array(length);
    let current = backing.getFloat64(address);
    for (let i = 0; i < length; i++) {
      array[i] = visitor(ElementType.load(backing, current), i, this);
      current += ElementType.byteLength;
    }
    return array;
  }

  /**
   * Filter the items in the array and return a new array containing the results.
   */
  filter (filterer: FilterVisitor): Array<any> {
    const ElementType = this[$ElementType];
    const backing = this[$Backing];
    const address = this[$Address];
    const length = backing.getUint32(address + 8);
    const array = [];
    let current = backing.getFloat64(address);
    for (let i = 0; i < length; i++) {
      const item = ElementType.load(backing, current);
      if (filterer(item, i, this)) {
        array.push(item);
      }
      current += ElementType.byteLength;
    }
    return array;
  }

  /**
   * Applies a function against an accumulator and each value of the array
   * (from left-to-right) to reduce it to a single value.
   */
  reduce (reducer: Reducer, initialValue?: any): any {
    const ElementType = this[$ElementType];
    const backing = this[$Backing];
    const address = this[$Address];
    const length = backing.getUint32(address + 8);
    if (length === 0) {
      return initialValue;
    }
    let result = initialValue;
    let current = backing.getFloat64(address);
    let index = 0;
    if (initialValue === undefined) {
      initialValue = ElementType.load(backing, current);
      current += ElementType.byteLength;
      index = 1;
    }
    for (; index < length; index++) {
      result = reducer(initialValue, ElementType.load(backing, current), index, this);
      current += ElementType.byteLength;
    }
    return result;
  }

  /**
   * Return a representation of the array which can be encoded as JSON.
   */
  toJSON () {
    const ElementType = this[$ElementType];
    const backing = this[$Backing];
    const address = this[$Address];
    const length = backing.getUint32(address + 8);
    const array = new Array(length);
    let current = backing.getFloat64(address);
    for (let i = 0; i < length; i++) {
      array[i] = ElementType.load(backing, current);
      current += ElementType.byteLength;
    }
    return array;
  }

  /**
   * Typed array iterator.
   */
  *[Symbol.iterator] () {
    const ElementType = this[$ElementType];
    const backing = this[$Backing];
    const address = this[$Address];
    const pointer = backing.getFloat64(address);
    const length = backing.getUint32(address + 8);
    for (let i = 0; i < length; i++) {
      yield ElementType.load(backing, pointer + (i * ElementType.byteLength));
    }
  }

}

/**
 * The number of slots which have so far been defined.
 */
let definedSlotCount = 0;

/**
 * Ensure that the typed array prototype has at least the given number of slots.
 */
function ensureSlots (min: uint32) {
  if (definedSlotCount >= min) {
    return;
  }
  const max = Math.max(min, definedSlotCount * 1.5) + 100;
  for (let index = definedSlotCount; index < max; index++) {
    Object.defineProperty(TypedArray.prototype, index, {
      get (): any {
        return this[$GetElement](index);
      },
      set (value: any): void {
        return this[$SetElement](index, value);
      }
    });
    definedSlotCount++;
  }
}

/**
 * Makes a TypedArray type class for a given realm.
 */
export function make ({TypeClass, ReferenceType, backing}: Realm): TypeClass<TypedArray> {
  return new TypeClass('ArrayType', (ElementType: Type, config: Object = {}): Function => {
    return (Partial: Type<any>): Object => {
      const canContainReferences = ElementType[$CanContainReferences];
      Partial[$CanBeEmbedded] = true;
      Partial[$CanBeReferenced] = true;
      Partial[$CanContainReferences] = canContainReferences;

      const name = (typeof config.name === 'string' && config.name.length)
                    ? config.name
                    : `Array<${ElementType.name}>`;

      Partial.ref = new ReferenceType(`Reference<${name}>`, Partial);

      const prototype = Object.create(TypedArray.prototype);
      prototype[$ElementType] = ElementType;

      prototype.BYTES_PER_ELEMENT = ElementType.byteLength;
      Partial.BYTES_PER_ELEMENT = ElementType.byteLength;

      /**
       * The constructor for array type instances.
       */
      function constructor (backingOrInput: ?Backing|Object, address: ?float64) {
        if (backingOrInput instanceof Backing) {
          this[$Backing] = backingOrInput;
          this[$Address] = address;
          ensureSlots(this.length);
        }
        else {
          this[$Backing] = backing;
          this[$Address] = createArray(backing, backingOrInput);
        }
      }

      /**
       * Get an element at the given index.
       */
      prototype[$GetElement] = function GetElement (index: uint32): any {
        const normalizedIndex = index >>> 0;
        const backing = this[$Backing];
        const address = this[$Address];
        const length = backing.getUint32(address + 8);
        if (length === 0 || normalizedIndex >= length) {
          throw new RangeError(`Cannot get an element at index ${normalizedIndex} from an array of length ${length}.`);
        }
        const pointer = backing.getFloat64(address);
        assert: pointer > 0;
        return ElementType.load(backing, pointer + (normalizedIndex * ElementType.byteLength));
      };

      /**
       * Set an element at the given index.
       */
      prototype[$SetElement] = function SetElement (index: uint32, value: any): void {
        const normalizedIndex = index >>> 0;
        const backing = this[$Backing];
        const address = this[$Address];
        const length = backing.getUint32(address + 8);
        if (length === 0 || normalizedIndex >= length) {
          throw new RangeError(`Cannot set an element at index ${normalizedIndex} in an array of length ${length}.`);
        }
        const pointer = backing.getFloat64(address);
        assert: pointer > 0;
        return ElementType.store(backing, pointer + (normalizedIndex * ElementType.byteLength), value);
      };

      /**
       * Allocate space for the given array and write the input if any.
       */
      function createArray (backing: Backing, input: any): float64 {
        if (input == null) {
          const address = backing.gc.alloc(16);
          backing.setFloat64(address, 0);
          backing.setUint32(address + 8, 0);
          return address;
        }
        else if (typeof input === 'number') {
          if (input >>> 0 !== input) {
            throw new TypeError(`Cannot create a typed array with an invalid length.`);
          }
          else if (input === 0) {
            const address = backing.gc.alloc(16);
            backing.setFloat64(address, 0);
            backing.setUint32(address + 8, 0);
            return address;
          }
          else {
            ensureSlots(input);
            const byteLength = input * ElementType.byteLength;
            const address = backing.gc.alloc(byteLength + 16);
            backing.setFloat64(address, address + 16);
            backing.setUint32(address + 8, input);
            writeDefaultValues(backing, address + 16, input);
            return address;
          }
        }
        else if (typeof input === 'object') {
          let array;
          if (Array.isArray(input)) {
            array = input;
          }
          else if (input[Symbol.iterator]) {
            array = Array.from(input);
          }
          else {
            throw new TypeError(`Cannot create a typed array from a non-iterable input.`);
          }
          if (array.length === 0) {
            const address = backing.gc.alloc(16);
            backing.setFloat64(address, 0);
            backing.setUint32(address + 8, 0);
            return address;
          }
          else {
            ensureSlots(array.length);
            const byteLength = array.length * ElementType.byteLength;
            const address = backing.gc.alloc(byteLength + 16);
            backing.setFloat64(address, address + 16);
            backing.setUint32(address + 8, array.length);
            writeValues(backing, address + 16, array);
            return address;
          }
        }
        else {
          throw new TypeError(`Cannot create a typed array from invalid input.`);
        }
      }

      /**
       * Write empty values to the given address.
       */
      function writeDefaultValues (backing: Backing, address: float64, length: uint32): float64 {
        let current = address;
        for (let i = 0; i < length; i++) {
          ElementType.initialize(backing, current);
          current += ElementType.byteLength;
        }
        return address;
      }

      /**
       * Write values to the given address.
       */
      function writeValues (backing: Backing, address: float64, input: Array<any>): float64 {
        const length = input.length;
        let current = address;
        for (let i = 0; i < length; i++) {
          ElementType.initialize(backing, current, input[i]);
          current += ElementType.byteLength;
        }
        return address;
      }

      /**
       * Initialize the given array at the given address.
       */
      function initializeArray (backing: Backing, address: float64, input: Array<any>): void {
        if (input == null) {
          backing.setFloat64(address, 0);
          backing.setUint32(address + 8, 0);
        }
        else if (typeof input === 'object') {
          let array;
          if (Array.isArray(input)) {
            array = input;
          }
          else if (input[Symbol.iterator]) {
            array = Array.from(input);
          }
          else {
            throw new TypeError(`Cannot create a typed array from a non-iterable input.`);
          }

          if (array.length === 0) {
            backing.setFloat64(address, 0);
            backing.setUint32(address + 8, 0);
          }
          else {
            const byteLength = array.length * ElementType.byteLength;
            const dataAddress = backing.alloc(byteLength);
            backing.setFloat64(address, dataAddress);
            backing.setUint32(address + 8, array.length);
            writeValues(backing, dataAddress, array);
          }
        }
        else {
          throw new TypeError(`Cannot create a typed array from invalid input.`);
        }
      }

      /**
       * Store the given array at the given address.
       */
      function storeArray (backing: Backing, address: float64, input: Array<any>): void {
        const existing = backing.getFloat64(address);
        if (existing > 0) {
          assert: existing !== address + 16, "Cannot overwrite the body of a heap allocated array."
          if (canContainReferences) {
            const length = backing.getUint32(address + 8);
            let current = existing;
            for (let i = 0; i < length; i++) {
              ElementType.destructor(backing, current);
              current += ElementType.byteLength;
            }
          }
          backing.free(existing);
        }

        if (input == null) {
          backing.setFloat64(address, 0);
          backing.setUint32(address + 8, 0);
        }
        else if (typeof input === 'object') {
          let array;
          if (Array.isArray(input)) {
            array = input;
          }
          else if (input[Symbol.iterator]) {
            array = Array.from(input);
          }
          else {
            throw new TypeError(`Cannot create a typed array from a non-iterable input.`);
          }

          if (array.length === 0) {
            backing.setFloat64(address, 0);
            backing.setUint32(address + 8, 0);
          }
          else {
            const byteLength = array.length * ElementType.byteLength;
            const dataAddress = backing.alloc(byteLength);
            backing.setFloat64(address, dataAddress);
            backing.setUint32(address + 8, array.length);
            writeValues(backing, dataAddress, array);
          }
        }
        else {
          throw new TypeError(`Cannot create a typed array from invalid input.`);
        }
      }

      /**
       * Load the array at the given address.
       */
      function loadArray (backing: Backing, address: float64): Partial {
        return new Partial(backing, address);
      }

      /**
       * Hash the given array.
       */
      function hashArray (array: Partial): uint32 {
        const backing = array[$Backing];
        const address = array[$Address];
        let current = backing.getFloat64(address);
        const length = backing.getUint32(address + 8);
        let hash = 0x811c9dc5;
        for (let i = 0; i < length; i++) {
          hash ^= ElementType.hashValue(ElementType.load(backing, current));
          hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
          current += ElementType.byteLength;
        }
        return hash >>> 0;
      }

      /**
       * Return a random array.
       */
      function randomArray () {
        const length = Math.floor(Math.random() * Math.pow(2, 7));
        const array = new Array(length);
        for (let i = 0; i < length; i++) {
          array[i] = ElementType.randomValue();
        }
        return new Partial(array);
      }

      return Object.assign({
        name,
        byteAlignment: 8,
        byteLength: 16,
        gc: true,
        constructor: constructor,
        prototype: prototype,
        accepts (input: any): boolean {
          return input == null || input instanceof Partial || Array.isArray(input) || input[Symbol.iterator];
        },
        cast (input: any): any {
          if (input instanceof Partial) {
            return input;
          }
          else {
            return new Partial(input);
          }
        },
        initialize: initializeArray,
        store: storeArray,
        load: loadArray,
        clear (backing: Backing, address: float64): void {
          const pointer = backing.getFloat64(address);
          assert: pointer > 0;
          const length = backing.getUint32(address + 8);
          let current = pointer;
          for (let i = 0; i < length; i++) {
            ElementType.clear(backing, current);
            current += ElementType.byteLength;
          }
        },
        destructor (backing: Backing, address: float64): void {
          const pointer = backing.getFloat64(address);
          assert: pointer > 0;
          if (canContainReferences) {
            const length = backing.getUint32(address + 8);
            let current = pointer;
            for (let i = 0; i < length; i++) {
              ElementType.destructor(backing, current);
              current += ElementType.byteLength;
            }
          }
          if (pointer !== address + 16) {
            // this was allocated using `TypedArray.store()`
            // so we need to reclaim the data segment separately
            backing.free(pointer);
          }
          backing.setFloat64(address, 0);
          backing.setUint32(address + 8, 0);
        },
        compareValues (valueA: any, valueB: any): int8 {
          if (valueA === valueB) {
            return 0;
          }
          else if (valueA > valueB) {
            return 1;
          }
          else {
            return -1;
          }
        },
        compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8 {
          if (addressA === addressB) {
            return 0;
          }
          else if (addressA === 0) {
            return -1;
          }
          else if (addressB === 0) {
            return 1;
          }

          const valueA = Partial.load(backing, addressA);
          const valueB = Partial.load(backing, addressB);
          if (valueA === valueB) {
            return 0;
          }
          else if (valueA > valueB) {
            return 1;
          }
          else {
            return -1;
          }
        },
        compareAddressValue (backing: Backing, address: float64, value: any): int8 {
          const loaded = Partial.load(backing, address);
          if (loaded === value) {
            return 0;
          }
          else if (loaded > value) {
            return 1;
          }
          else {
            return -1;
          }
        },
        emptyValue (): Array<any> {
          return [];
        },
        hashValue: hashArray,
        randomValue: randomArray
      }, config);
    };
  });
};
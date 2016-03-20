/* @flow */

import Backing from "backing";
import {inspect} from "util";
import {TypedObject} from "../";
import {alignTo} from "../../util";

import type {Realm} from "../../";

import {
  $ValueType,
  $Backing,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences
} from "../../symbols";

export const MIN_TYPE_ID = Math.pow(2, 20) * 9;

/**
 * Makes a EnumType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<EnumType<any>> {
  const {TypeClass} = realm;
  let typeCounter = 0;

  function createTinyEnumType (Enum: Function, possibleValues: Type[]): Object {
    const name = possibleValues.map(value => inspect(value)).join(' | ');
    const id = MIN_TYPE_ID + typeCounter;
    const byteAlignment = 1;
    const byteLength = 1;

    function enumAccepts (input: any): boolean {
      const length = possibleValues.length;
      for (let i = 0; i < length; i++) {
        if (input === possibleValues[i]) {
          return true;
        }
      }
      return false;
    }

    function indexFor (value: any): number {
      const length = possibleValues.length;
      for (let i = 0; i < length; i++) {
        if (value === possibleValues[i]) {
          return i;
        }
      }
      return -1;
    }


    function initializeEnum (backing: Backing, address: float64, initialValue: any): void {
      let index = indexFor(initialValue);
      if (index === -1) {
        if (initialValue === undefined) {
          index = 0;
        }
        else {
          throw new TypeError(`Enum does not contain the given value: ${inspect(initialValue)}`);
        }
      }
      backing.setUint8(address, index);
    }

    function storeEnum (backing: Backing, address: float64, value: any): void {
      const index = indexFor(value);
      if (index === -1) {
        throw new TypeError(`Enum does not contain the given value: ${inspect(value)}`);
      }
      backing.setUint8(address, index);
    }

    function loadEnum (backing: Backing, address: float64): any {
      return possibleValues[backing.getUint8(address)];
    }

    function clearEnum (backing: Backing, address: float64): void {
      backing.setUint8(address, 0);
    }

    function enumDestructor (backing: Backing, address: float64): void {
      // no-op
    }

    return {
      id,
      name,
      byteLength,
      byteAlignment,
      accepts: enumAccepts,
      initialize: initializeEnum,
      store: storeEnum,
      load: loadEnum,
      clear: clearEnum,
      destructor: enumDestructor,
      equal (a: any, b: any): boolean {
        return a === b;
      },
      emptyValue (): any {
        return possibleValues[0];
      },
      randomValue (): any {
        return possibleValues[Math.floor(Math.random() * possibleValues.length)];
      },
      hashValue (input: any): uint32 {
        return indexFor(input) + 777;
      }
    };

  }

  function createLargeEnumType (Enum: Function, possibleValues: Type[]): Object {
    const name = possibleValues.map(value => inspect(value)).join(' | ');
    const id = MIN_TYPE_ID + typeCounter;
    const byteAlignment = 2;
    const byteLength = 2;
    const valueMap = new Map(possibleValues.map((value, index) => [value, index]));

    function enumAccepts (input: any): boolean {
      return valueMap.has(input);
    }

    function indexFor (value: any): number {
      const index = valueMap.get(value);
      if (typeof index === 'number') {
        return index;
      }
      else {
        return -1;
      }
    }


    function initializeEnum (backing: Backing, address: float64, initialValue: any): void {
      let index = indexFor(initialValue);
      if (index === -1) {
        if (initialValue === undefined) {
          index = 0;
        }
        else {
          throw new TypeError(`Enum does not contain the given value: ${inspect(initialValue)}`);
        }
      }
      backing.setUint16(address, index);
    }

    function storeEnum (backing: Backing, address: float64, value: any): void {
      const index = indexFor(value);
      if (index === -1) {
        throw new TypeError(`Enum does not contain the given value: ${inspect(value)}`);
      }
      backing.setUint16(address, index);
    }

    function loadEnum (backing: Backing, address: float64): any {
      return possibleValues[backing.getUint16(address)];
    }

    function clearEnum (backing: Backing, address: float64): void {
      backing.setUint16(address, 0);
    }

    function enumDestructor (backing: Backing, address: float64): void {
      // no-op
    }

    return {
      id,
      name,
      byteLength,
      byteAlignment,
      accepts: enumAccepts,
      initialize: initializeEnum,
      store: storeEnum,
      load: loadEnum,
      clear: clearEnum,
      destructor: enumDestructor,
      equal (a: any, b: any): boolean {
        return a === b;
      },
      emptyValue (): any {
        return possibleValues[0];
      },
      randomValue (): any {
        return possibleValues[Math.floor(Math.random() * possibleValues.length)];
      },
      hashValue (input: any): uint32 {
        return indexFor(input) + 777;
      }
    };

  }

  return new TypeClass('EnumType', (...possibleValues: Type[]) => {
    return (Enum: Function): Object => {
      typeCounter++;

      let EnumArray;
      // @flowIssue 285
      Object.defineProperties(Enum, {
        Array: {
          get () {
            if (EnumArray === undefined) {
              EnumArray = new realm.ArrayType(Enum);
            }
            return EnumArray;
          }
        }
      });

      Enum[$CanBeEmbedded] = true;
      Enum[$CanBeReferenced] = false;
      Enum[$CanContainReferences] = false;

      if (possibleValues.length >= Math.pow(2, 16)) {
        throw new RangeError(`Enum can only store up to ${Math.pow(2, 16)} values.`);
      }
      else if (possibleValues.length >= 256) {
        return createLargeEnumType(Enum, possibleValues);
      }
      else {
        return createTinyEnumType(Enum, possibleValues);
      }
    };
  });
};

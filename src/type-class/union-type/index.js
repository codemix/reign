/* @flow */

import Backing from "backing";
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

export const MIN_TYPE_ID = Math.pow(2, 20) * 8;

/**
 * Makes a UnionType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<UnionType<any>> {
  const {TypeClass} = realm;
  let typeCounter = 0;
  return new TypeClass('UnionType', (...possibleTypes: Type[]) => {
    return (Union: Function): Object => {
      typeCounter++;
      const name = possibleTypes.map(PossibleType => PossibleType.name).join(' | ');
      const id = MIN_TYPE_ID + typeCounter;

      Union[$CanBeEmbedded] = true;
      Union[$CanBeReferenced] = false;
      Union[$CanContainReferences] = possibleTypes.some((type: $Fixme<Type>): boolean => type[$CanContainReferences]);

      const byteAlignment = Math.max(4, ...possibleTypes.map(type => type.byteAlignment));
      const byteLength = alignTo(Math.max(...possibleTypes.map(type => type.byteLength)) + 4, byteAlignment);
      const idOffset = byteLength - 4;

      let UnionArray;
      // @flowIssue 285
      Object.defineProperties(Union, {
        Array: {
          get () {
            if (UnionArray === undefined) {
              UnionArray = new realm.ArrayType(Union);
            }
            return UnionArray;
          }
        }
      });

      const prototype = Object.create(null, {
        // @flowIssue 285
        value: {
          enumerable: true,
          get (): any {
            const backing = this[$Backing];
            const address = this[$Address];
            const typeId = backing.getUint32(address + idOffset);
            if (typeId === 0) {
              return null;
            }
            else {
              return realm.I[typeId].load(backing, address);
            }
          },
          set (value: any): void {
            const backing = this[$Backing];
            const address = this[$Address];
            storeUnion(backing, address, value);
          }
        },
        // @flowIssue 285
        type: {
          enumerable: true,
          get (): ?Type {
            const typeId = this[$Backing].getUint32(this[$Address] + idOffset);
            return typeId === 0 ? null : realm.I[typeId];
          }
        },
        inspect: {
          value () {
            return this.value;
          }
        },
        valueOf: {
          value () {
            return this.value;
          }
        },
        toJSON: {
          value () {
            const value = this.value;
            if (value != null && typeof value === 'object' && typeof value.toJSON === 'function') {
              return value.toJSON();
            }
            else {
              return value;
            }
          }
        }
      });

      function constructor (backingOrInput: Backing|any, address?: float64) {
        if (backingOrInput instanceof Backing) {
          this[$Backing] = backingOrInput;
          this[$Address] = address;
        }
        else {
          const backing = realm.backing;
          this[$Backing] = backing;
          this[$Address] = backing.gc.alloc(byteLength, Union.id);
          initializeUnion(backing, this[$Address], backingOrInput);
        }
      }

      function unionAccepts (input: any): boolean {
        for (let i = 0; i < possibleTypes.length; i++) {
          const type = possibleTypes[i];
          if (type.accepts(input)) {
            return true;
          }
        }
        return false;
      }

      function initializeUnion (backing: Backing, address: float64, initialValue?: any): void {
        if (initialValue == null) {
          backing.setUint32(address + idOffset, 0);
        }
        else {
          const type = typeFor(initialValue);
          type.initialize(backing, address, initialValue);
          backing.setUint32(address + idOffset, type.id);
        }
      }

      function storeUnion (backing: Backing, address: float64, value: any): void {
        const existing = backing.getUint32(address + idOffset);
        if (existing !== 0) {
          realm.I[existing].clear(backing, address);
        }
        else if (value == null) {
          // nothing to do.
          return;
        }

        if (value == null) {
          backing.setUint32(address + idOffset, 0);
        }
        else {
          const type = typeFor(value);
          type.initialize(backing, address, value);
          backing.setUint32(address + idOffset, type.id);
        }
      }

      function loadUnion (backing: Backing, address: float64): any {
        const typeId = backing.getUint32(address + idOffset);
        if (typeId === 0) {
          return null;
        }
        else {
          return realm.I[typeId].load(backing, address);
        }
      }

      function clearUnion (backing: Backing, address: float64): void {
        const typeId = backing.getUint32(address + idOffset);
        if (typeId !== 0) {
          backing.setUint32(backing, address + idOffset, 0);
          realm.I[typeId].clear(backing, address);
        }
      }

      function unionDestructor (backing: Backing, address: float64): void {
        const typeId = backing.getUint32(address + idOffset);
        if (typeId !== 0) {
          realm.I[typeId].clear(backing, address);
        }
      }

      function typeFor (input: any): Type {
        for (let i = 0; i < possibleTypes.length; i++) {
          const type = possibleTypes[i];
          if (type.accepts(input)) {
            return type;
          }
        }
        throw new TypeError(`Union does not contain a type which can accept the given input.`);
      }


      return {
        id,
        name,
        byteLength,
        byteAlignment,
        constructor,
        prototype,
        accepts: unionAccepts,
        initialize: initializeUnion,
        store: storeUnion,
        load: loadUnion,
        clear: clearUnion,
        destructor: unionDestructor,
        equal (a: any, b: any): any {
          return typeFor(a).equal(a, b);
        },
        emptyValue (): null {
          return null;
        },
        randomValue (): any {
          return possibleTypes[Math.floor(Math.random() * possibleTypes.length)].randomValue();
        },
        hashValue (input: any): uint32 {
          return typeFor(input).hashValue(input);
        }
      };
    };
  });
};
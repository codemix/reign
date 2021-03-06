/* @flow */

import Backing from "backing";
import {TypedObject} from "../";

import type {Realm} from "../../";

import {
  $Backing,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences
} from "../../symbols";

export class Primitive extends TypedObject {}

/**
 * Makes a PrimitiveType type class for a given realm.
 */
export function make (realm: Realm): TypeClass<PrimitiveType<any>> {
  const {TypeClass, backing, registry} = realm;
  const idRange = registry.range('PrimitiveType');

  return new TypeClass('PrimitiveType', (config: Object): Function => {
    return (primitive: PrimitiveType<any>): Object => {
      const name = config.name || `%Primitive<0x${idRange.value.toString(16)}>`;
      const id = config.id || idRange.next();

      // @flowIssue 252
      primitive[$CanBeEmbedded] = true;
      // @flowIssue 252
      primitive[$CanBeReferenced] = false;
      // @flowIssue 252
      primitive[$CanContainReferences] = false;
      let PrimitiveArray;
      // @flowIssue 285
      Object.defineProperties(primitive, {
        Array: {
          get (): TypedArray<PrimitiveType<any>> {
            if (PrimitiveArray === undefined) {
              PrimitiveArray = new realm.ArrayType(primitive);
            }
            return PrimitiveArray;
          }
        }
      });
      return Object.assign({
        name,
        id,
        gc: false,
        accepts (input: any): boolean {
          return false;
        },
        cast (input: any): any {
          return input;
        },
        initialize (backing: Backing, address: float64, initialValue?: any): void {
          primitive.store(backing, address, initialValue);
        },
        clear (backing: Backing, address: float64): void {
          primitive.store(backing, address, primitive.emptyValue());
        },
        destructor (): void {
          // no-op
        },
        constructor (input: Backing|any, address?: float64): any {
          if (this instanceof Primitive) {
            throw new TypeError(`${name} is not a constructor.`);
          }
          return primitive.cast(input);
        },
        prototype: Primitive.prototype,
        equal (valueA: any, valueB: any): boolean {
          return valueA === valueB;
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

          const valueA = primitive.load(backing, addressA);
          const valueB = primitive.load(backing, addressB);
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
          const loaded = primitive.load(backing, address);
          if (loaded === value) {
            return 0;
          }
          else if (loaded > value) {
            return 1;
          }
          else {
            return -1;
          }
        }
      }, config);
    };
  });
};
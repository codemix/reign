/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm): PrimitiveType<boolean> {
  return new PrimitiveType({
    name: 'Boolean',
    byteAlignment: 1,
    byteLength: 1,
    cast (input: any): boolean {
      return input ? true : false;
    },
    accepts (input: any): boolean {
      return typeof input === 'boolean';
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setUint8(address, value ? 1 : 0);
    },
    load (backing: Backing, address: float64): boolean {
      return backing.getUint8(address) ? true : false;
    },
    emptyValue (): boolean {
      return false;
    },
    randomValue (): boolean {
      return Math.random() >= 0.5 ? true : false;
    },
    hashValue (input): uint32 {
     return hashInteger(input ? 1 : 0);
   }
  });
}
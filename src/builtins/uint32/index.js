/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm): PrimitiveType<uint32> {
  return new PrimitiveType({
    name: 'Uint32',
    byteAlignment: 4,
    byteLength: 4,
    cast (input: any): uint32 {
      return input >>> 0;
    },
    accepts (input: any): boolean {
      return typeof input === 'number' && !isNaN(input) && input >= 0 && input <= 4294967295 && input === Math.floor(input);
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setUint32(address, value);
    },
    load (backing: Backing, address: float64): uint32 {
      return backing.getUint32(address);
    },
    emptyValue (): uint32 {
      return 0;
    },
    randomValue (): uint32 {
      return Math.floor(Math.random() * Math.pow(2, 32));
    },
    hashValue: hashInteger
  });
}
/* @flow */

import hashFloat64 from "../../hash-functions/float64";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm, typeId: uint32): Type<float64> {
  return new PrimitiveType('Float64', {
    id: typeId,
    byteAlignment: 8,
    byteLength: 8,
    cast (input: any): float64 {
      return +input || 0;
    },
    accepts (input: any): boolean {
      return typeof input === 'number' && !isNaN(input);
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setFloat64(address, +value || 0);
    },
    load (backing: Backing, address: float64): float64 {
      return backing.getFloat64(address);
    },
    emptyValue (): float64 {
      return 0;
    },
    randomValue (): float64 {
      return ((Math.random() * Math.pow(2, 16)) * Math.pow(2, 8)) - Math.random() * Math.pow(2, 24)
    },
    hashValue: hashFloat64
  });
}
/* @flow */

import hashFloat32 from "../../hash-functions/float32";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm): PrimitiveType<float32> {
  return new PrimitiveType({
    name: 'Float32',
    byteAlignment: 4,
    byteLength: 4,
    cast (input: any): float32 {
      return Math.fround(input) || 0;
    },
    accepts (input: any): boolean {
      return Math.fround(input) === input;
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setFloat32(address, Math.fround(value) || 0);
    },
    load (backing: Backing, address: float64): float32 {
      return backing.getFloat32(address);
    },
    emptyValue (): float32 {
      return 0;
    },
    randomValue (): float32 {
      return Math.fround(((Math.random() * Math.pow(2, 16)) * Math.pow(2, 8)) - Math.random() * Math.pow(2, 24));
    },
    hashValue: hashFloat32
  });
}
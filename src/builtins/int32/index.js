/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm, typeId: uint32): PrimitiveType<int32> {
  return new PrimitiveType({
    id: typeId,
    name: 'Int32',
    byteAlignment: 4,
    byteLength: 4,
    cast (input: any): int32 {
      return input | 0;
    },
    accepts (input: any): boolean {
      return typeof input === 'number' && !isNaN(input) && input >= -2147483648 && input <= 2147483647 && input === Math.floor(input);
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setInt32(address, value);
    },
    load (backing: Backing, address: float64): int32 {
      return backing.getInt32(address);
    },
    emptyValue (): int32 {
      return 0;
    },
    randomValue (): int32 {
      return Math.floor(Math.random() * Math.pow(2, 32)) - Math.pow(2, 31);
    },
    hashValue: hashInteger
  });
}
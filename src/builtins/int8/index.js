/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm, typeId: uint32): PrimitiveType<int8> {
  return new PrimitiveType('Int8', {
    id: typeId,
    byteAlignment: 1,
    byteLength: 1,
    cast (input: any): int8 {
      return (input & 255) << 24 >> 24;
    },
    accepts (input: any): boolean {
      return typeof input === 'number' && !isNaN(input) && input >= -128 && input <= 127 && input === Math.floor(input);
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setInt8(address, value);
    },
    load (backing: Backing, address: float64): int8 {
      return backing.getInt8(address);
    },
    emptyValue (): int8 {
      return 0;
    },
    randomValue (): int8 {
      return Math.floor(Math.random() * Math.pow(2, 8)) - Math.pow(2, 7);
    },
    hashValue: hashInteger
  });
}

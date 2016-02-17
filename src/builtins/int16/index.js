/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm, typeId: uint32): Type<int16> {
  return new PrimitiveType('Int16', {
    id: typeId,
    byteAlignment: 2,
    byteLength: 2,
    cast (input: any): int16 {
      return (input & 65535) << 16 >> 16;
    },
    accepts (input: any): boolean {
      return typeof input === 'number' && !isNaN(input) && input >= -32768 && input <= 32767 && input === Math.floor(input);
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setInt16(address, value);
    },
    load (backing: Backing, address: float64): int16 {
      return backing.getInt16(address);
    },
    emptyValue (): int16 {
      return 0;
    },
    randomValue (): int16 {
      return Math.floor(Math.random() * Math.pow(2, 16)) - Math.pow(2, 15);
    },
    hashValue: hashInteger
  });
}
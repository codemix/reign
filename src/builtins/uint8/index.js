/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm, typeId: uint32): Type<uint8> {
  return new PrimitiveType('Uint8', {
    id: typeId,
    byteAlignment: 1,
    byteLength: 1,
    cast (input: any): uint8 {
      return input & 255;
    },
    accepts (input: any): boolean {
      return typeof input === 'number' && !isNaN(input) && input >= 0 && input <= 255 && input === Math.floor(input);
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setUint8(address, value);
    },
    load (backing: Backing, address: float64): uint8 {
      return backing.getUint8(address);
    },
    emptyValue (): uint8 {
      return 0;
    },
    randomValue (): uint8 {
      return Math.floor(Math.random() * Math.pow(2, 8));
    },
    hashValue: hashInteger
  });
}
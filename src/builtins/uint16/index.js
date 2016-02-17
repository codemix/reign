/* @flow */

import hashInteger from "../../hash-functions/integer";

import type Backing from "backing";
import type {Realm} from "../..";

export function make ({PrimitiveType}: Realm, typeId: uint32): Type<uint32> {
  return new PrimitiveType('Uint16', {
    id: typeId,
    byteAlignment: 2,
    byteLength: 2,
    cast (input: any): uint16 {
      return input & 65535;
    },
    accepts (input: any): boolean {
      return typeof input === 'number' && !isNaN(input) && input >= 0 && input <= 65535 && input === Math.floor(input);
    },
    store (backing: Backing, address: float64, value: number): void {
      backing.setUint16(address, value);
    },
    load (backing: Backing, address: float64): uint16 {
      return backing.getUint16(address);
    },
    emptyValue (): uint16 {
      return 0;
    },
    randomValue (): uint16 {
      return Math.floor(Math.random() * Math.pow(2, 16));
    },
    hashValue: hashInteger
  });
}
/* @flow */

import Backing from "backing";
import {TypedObject} from "../";

import type {Realm} from "../../";

export const $Backing = Symbol.for('Backing');
export const $Address = Symbol.for('Address');

export class Primitive extends TypedObject {}

/**
 * Makes a PrimitiveType type class for a given realm.
 */
export function make ({TypeClass, backing}: Realm): TypeClass<Primitive> {
  return new TypeClass('PrimitiveType', (name: string, config: Object): Object => {
    const primitive = Object.assign({
      name,
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
      cleanup (backing: Backing, address: float64): void {
        primitive.store(backing, address, primitive.emptyValue());
      },
      constructor (input: Backing|any, address?: float64): any {
        if (this instanceof Primitive) {
          throw new TypeError(`${name} is not a constructor.`);
        }
        return primitive.cast(input);
      },
      prototype: Primitive.prototype
    }, config);

    return primitive;
  });
};
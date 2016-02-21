/* @flow */

import Backing from "backing";
import {TypedObject} from "../";

import type {Realm} from "../../";

import {
  $Backing,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences,
  $ElementType,
  $GetElement,
  $SetElement
} from "../../symbols";

export type ForEachVisitor = (element: any, index: uint32, context: HashMap) => void;
export type MapVisitor = (element: any, index: uint32, context: HashMap) => any;
export type FilterVisitor = (element: any, index: uint32, context: HashMap) => boolean;

export class HashMap<K, V> extends TypedObject {

  /**
   * Return the size of the hash map.
   */
  get size (): uint32 {
    return this[$Backing].getUint32(this[$Address] + 8);
  }

  /**
   * Get the value associated with the given key, otherwise undefined.
   */
  get (key: K): ?V {

  }

}

export function make ({TypeClass, ReferenceType, backing}: Realm): TypeClass<HashMap<any, any>> {
  return new TypeClass('HashMapType', (KeyType: Type<any>, ValueType: Type<any>): (Partial: Function) => Object => {
    return (Partial: Function) => {

      const prototype = Object.create(HashMap.prototype, {
        get: {
          value: function getHashMapValue (key: KeyType): ?ValueType {

          }
        }
      });

      return {

      };
    };
  });
}
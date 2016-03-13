/* @flow */

import type {Realm} from "../../";
import type Backing from "backing";

import {
  $ValueType,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences
} from "../../symbols";

export const MIN_TYPE_ID = Math.pow(2, 20) * 5;

/**
 * Makes an ObjectType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<ObjectType<Object>> {
  const {TypeClass, ReferenceType} = realm;
  let typeCounter = 0;
  return new TypeClass('ObjectType', (config: Object): Function => {
    return (Partial: Function): Object => {
      typeCounter++;
      const name = config.name || `%Object<0x${typeCounter.toString(16)}>`;
      const id = config.id || (MIN_TYPE_ID + typeCounter);

      Partial[$CanBeEmbedded] = false;
      Partial[$CanBeReferenced] = true;
      Partial[$CanContainReferences] = true;

      let ObjectArray;
      // @flowIssue 285
      Object.defineProperties(Partial, {
        id: {
          value: id
        },
        name: {
          value: name
        },
        Array: {
          get () {
            if (ObjectArray === undefined) {
              ObjectArray = new realm.ArrayType(Partial);
            }
            return ObjectArray;
          }
        }
      });

      Partial.ref = new ReferenceType(Partial);

      return {...config, id, name};
    };
  });
};
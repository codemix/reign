/* @flow */

import {TypedObject} from "../";
import type {Realm} from "../../";
import type Backing from "backing";

import {
  $ValueType,
  $Address,
  $CanBeEmbedded,
  $CanBeReferenced,
  $CanContainReferences
} from "../../symbols";

export const MIN_TYPE_ID = Math.pow(2, 20) * 1;

/**
 * Makes a StringType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<PrimitiveType<string>> {
  const {TypeClass} = realm;
  let typeCounter = 0;
  return new TypeClass('StringType', (config: Object): Function => {
    return (Partial: Function): Object => {
      typeCounter++;
      const name = config.name || `%String<0x${typeCounter.toString(16)}>`;
      const id = config.id || (MIN_TYPE_ID + typeCounter);

      Partial[$CanBeEmbedded] = false;
      Partial[$CanBeReferenced] = true;
      Partial[$CanContainReferences] = true;

      let StringArray;
      // @flowIssue 285
      Object.defineProperties(Partial, {
        Array: {
          get () {
            if (StringArray === undefined) {
              StringArray = new realm.ArrayType(Partial);
            }
            return StringArray;
          }
        }
      });
      return {...config, id, name};
    };
  });
};
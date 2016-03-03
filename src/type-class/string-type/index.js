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

/**
 * Makes a StringType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<PrimitiveType<string>> {
  const {TypeClass} = realm;
  return new TypeClass('StringType', (name: string, config: Object): Function => {
    return (Partial: Function): Object => {

      Partial[$CanBeEmbedded] = false;
      Partial[$CanBeReferenced] = true;
      Partial[$CanContainReferences] = false;

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

      return Object.assign(
        {
          name,
        },
        config
      );
    };
  });
};
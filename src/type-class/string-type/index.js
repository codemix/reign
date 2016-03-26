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
  const {TypeClass, registry} = realm;
  const idRange = registry.range('StringType');
  return new TypeClass('StringType', (config: Object): Function => {
    return (Partial: Function): Object => {
      const id = config.id || idRange.next();
      const name = config.name || `%String<0x${id.toString(16)}>`;

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
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

/**
 * Makes an ObjectType type class for the given realm.
 */
export function make (realm: Realm): TypeClass<ObjectType<Object>> {
  const {TypeClass, ReferenceType, registry} = realm;
  const idRange = registry.range('ObjectType');
  return new TypeClass('ObjectType', (config: Object): Function => {
    return (Partial: Function): Object => {
      const name = config.name || `%Object<0x${idRange.value.toString(16)}>`;
      const id = config.id || idRange.next();

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
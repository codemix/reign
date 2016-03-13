/* @flow */

import type {Realm} from "../..";

export function make ({HashSetType, T}: Realm): HashSetType<any, any> {
  return new HashSetType(T.Any, {
    name: 'HashSet'
  });
}
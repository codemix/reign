/* @flow */

import type {Realm} from "../..";

export function make ({HashMapType, T}: Realm): HashMapType<any, any> {
  return new HashMapType(T.Any, T.Any, {
    name: 'HashMap'
  });
}
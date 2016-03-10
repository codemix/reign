/* @flow */

import type {Realm} from "../..";

export function make ({ArrayType, T}: Realm): ArrayType<any> {
  return new ArrayType(T.Any, {
    name: 'Array'
  });
}
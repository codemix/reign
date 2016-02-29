/* @flow */

import type Backing from "backing";
import type {Realm} from "../..";

import {$StringPool} from "../../symbols";

export function make (realm: Realm, typeId: uint32): Type<string> {
  const pool = realm[$StringPool];
  return pool.makeStringType('String', typeId);
}
/* @flow */

import type TypeRegistry from "type-registry";
import type {Realm} from "../";

import {make as makeInt8} from "./int8";
import {make as makeUint8} from "./uint8";
import {make as makeInt16} from "./int16";
import {make as makeUint16} from "./uint16";
import {make as makeInt32} from "./int32";
import {make as makeUint32} from "./uint32";

import {make as makeFloat32} from "./float32";
import {make as makeFloat64} from "./float64";
//import {make as makeNumber} from "./number";

import {make as makeBoolean} from "./boolean";
import {make as makeString} from "./string";
import {make as makeInternedString} from "./interned-string";


export function registerBuiltins (realm: Realm): TypeRegistry {

  const registry = realm.registry;

  registry.add(makeInt8(realm, 1));
  registry.add(makeUint8(realm, 2));
  registry.add(makeInt16(realm, 3));
  registry.add(makeUint16(realm, 4));
  registry.add(makeInt32(realm, 5));
  registry.add(makeUint32(realm, 6));
  registry.add(makeFloat32(realm, 7));
  registry.add(makeFloat64(realm, 8));
  //registry.add(makeNumber(realm, 9));
  registry.add(makeBoolean(realm, 10));
  registry.add(makeString(realm, 11));
  registry.add(makeInternedString(realm, 12));

  return registry;
}
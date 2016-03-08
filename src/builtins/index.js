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

  makeInt8(realm);
  makeUint8(realm);
  makeInt16(realm);
  makeUint16(realm);
  makeInt32(realm);
  makeUint32(realm);
  makeFloat32(realm);
  makeFloat64(realm);
  //makeNumber(realm, 9);
  makeBoolean(realm);
  makeString(realm);
  makeInternedString(realm);

  return registry;
}
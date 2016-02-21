/* @flow */
import {make as makeTypeClass} from "./type-class";
import {make as makePrimitiveType} from "./type-class/primitive-type";
import {make as makeReferenceType} from "./type-class/reference-type";
import {make as makeStructType} from "./type-class/struct-type";
import {make as makeArrayType} from "./type-class/array-type";
import {make as makeHashMapType} from "./type-class/hash-map-type";


import {registerBuiltins} from "./builtins";

import type Backing from "backing";
import type TypeRegistry from "type-registry";


export class Realm {

  TypeClass: Class<Type<any>>;

  PrimitiveType: Class<Type<any>>;
  ReferenceType: Class<Type<any>>;
  StructType: Class<Type<any>>;
  ArrayType: Class<Type<any>>;

  T: {
    [name: string|Symbol]: Type;
  };

  I: {
    [name: uint32]: Type;
  };

  backing: Backing;
  registry: TypeRegistry;
  isInitialized: boolean;

  constructor (backing: Backing) {
    this.backing = backing;
    this.registry = backing.registry;
    this.T = this.registry.T;
    this.I = this.registry.I;
    this.TypeClass = makeTypeClass(this);
    this.PrimitiveType = makePrimitiveType(this);
    this.ReferenceType = makeReferenceType(this);
    this.StructType = makeStructType(this);
    this.ArrayType = makeArrayType(this);
    this.HashMapType = makeHashMapType(this);
    this.isInitialized = false;
    registerBuiltins(this);
  }

  /**
   * Initialize the realm.
   */
  async init (): Promise<Realm> {
    if (this.isInitialized) {
      throw new Error(`Realm cannot be initialized twice.`);
    }
    if (!this.backing.isInitialized) {
      await this.backing.init();
    }
    this.isInitialized = true;
    Object.freeze(this);
    return this;
  }
}
/* @flow */
import {make as makeTypeClass} from "./type-class";
import {make as makePrimitiveType} from "./type-class/primitive-type";
import {make as makeStringType} from "./type-class/string-type";
import {make as makeReferenceType} from "./type-class/reference-type";
import {make as makeStructType} from "./type-class/struct-type";
import {make as makeObjectType} from "./type-class/object-type";
import {make as makeArrayType} from "./type-class/array-type";
import {make as makeHashMapType} from "./type-class/hash-map-type";

import {make as makeStringPool} from "./string-pool";


import {registerBuiltins} from "./builtins";


import type Backing from "backing";
import type TypeRegistry from "type-registry";
import type {StringPool} from "./string-pool";

import {$ValueType} from "./symbols";

const HEADER_ADDRESS = 336; // First usable block in the backing store.
const VERSION_ADDRESS = HEADER_ADDRESS;
const STRING_POOL_POINTER_ADDRESS = VERSION_ADDRESS + 8;
const HEADER_CHECKSUM_ADDRESS = STRING_POOL_POINTER_ADDRESS + 16;
const HEADER_SIZE = (HEADER_CHECKSUM_ADDRESS + 8) - HEADER_ADDRESS;
const FIRST_ADDRESS = HEADER_ADDRESS + HEADER_SIZE;

export class Realm {

  TypeClass: Class<TypeClass<Type>>;

  PrimitiveType: Class<TypeClass<PrimitiveType<any>>>;
  ReferenceType: Class<TypeClass<ReferenceType<any>>>;
  StructType: Class<TypeClass<StructType<Object>>>;
  ObjectType: Class<TypeClass<ObjectType<Object>>>;
  ArrayType: Class<TypeClass<ArrayType<any>>>;
  StringType: Class<TypeClass<PrimitiveType<string>>>;
  HashMapType: Class<TypeClass<HashMapType<any, any>>>;

  T: {
    [name: string|Symbol]: Type;
  };

  I: {
    [name: uint32]: Type;
  };

  backing: Backing;
  registry: TypeRegistry;
  strings: StringPool;
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
    this.ObjectType = makeObjectType(this);
    this.ArrayType = makeArrayType(this);
    this.StringType = makeStringType(this);
    this.HashMapType = makeHashMapType(this);
    this.isInitialized = false;
  }

  /**
   * Initialize the realm.
   */
  async init (): Promise<Realm> {
    if (this.isInitialized) {
      throw new Error(`Realm cannot be initialized twice.`);
    }
    trace: `Initializing the realm.`
    if (!this.backing.isInitialized) {
      await this.backing.init();
    }
    verifyHeader(this);

    this.strings = makeStringPool(this, STRING_POOL_POINTER_ADDRESS);
    registerBuiltins(this);
    this.isInitialized = true;
    Object.freeze(this);
    return this;
  }

  /**
   * Return the type of the given value.
   */
  typeOf (value: any): ?Type {
    if (value == null || typeof value === 'function' || typeof value === 'symbol') {
      return null;
    }
    else if (typeof value === 'number') {
      return this.T.Float64;
    }
    else if (typeof value === 'boolean') {
      return this.T.Boolean;
    }
    else if (typeof value === 'string') {
      return this.T.String;
    }
    else if (value[$ValueType]) {
      return value[$ValueType];
    }
    else if (Array.isArray(value)) {
      return this.T.Array;
    }
    else {
      return this.T.Object;
    }
  }
}


function verifyHeader (realm: Realm) {
  const backing: Backing = realm.backing;
  if (
    backing.getUint32(HEADER_ADDRESS) !== HEADER_ADDRESS ||
    backing.getUint32(HEADER_CHECKSUM_ADDRESS) !== HEADER_CHECKSUM_ADDRESS
  ) {
    const address = backing.calloc(HEADER_SIZE);

    /* istanbul ignore if  */
    if (address !== HEADER_ADDRESS) {
      throw new TypeError(`Allocator returned an invalid backing header address, got ${address} expected ${HEADER_ADDRESS}.`);
    }
    backing.setUint32(HEADER_ADDRESS, HEADER_ADDRESS);
    backing.setUint32(HEADER_CHECKSUM_ADDRESS, HEADER_CHECKSUM_ADDRESS);
    backing.setFloat64(STRING_POOL_POINTER_ADDRESS, 0);
  }
}


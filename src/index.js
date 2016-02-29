/* @flow */
import {make as makeTypeClass} from "./type-class";
import {make as makePrimitiveType} from "./type-class/primitive-type";
import {make as makeStringType} from "./type-class/string-type";
import {make as makeReferenceType} from "./type-class/reference-type";
import {make as makeStructType} from "./type-class/struct-type";
import {make as makeArrayType} from "./type-class/array-type";
import {make as makeHashMapType} from "./type-class/hash-map-type";

import {make as makeStringPool} from "./string-pool";


import {registerBuiltins} from "./builtins";
import {$StringPool} from "./symbols";


import type Backing from "backing";
import type TypeRegistry from "type-registry";

const HEADER_ADDRESS = 336; // First usable block in the backing store.
const VERSION_ADDRESS = HEADER_ADDRESS;
const STRING_POOL_POINTER_ADDRESS = VERSION_ADDRESS + 8;
const HEADER_CHECKSUM_ADDRESS = STRING_POOL_POINTER_ADDRESS + 16;
const HEADER_SIZE = (HEADER_CHECKSUM_ADDRESS + 8) - HEADER_ADDRESS;
const FIRST_ADDRESS = HEADER_ADDRESS + HEADER_SIZE;

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
    this[$StringPool] = makeStringPool(this, STRING_POOL_POINTER_ADDRESS);
    registerBuiltins(this);
    this.isInitialized = true;
    Object.freeze(this);
    return this;
  }

  /**
   * Ensure that the given value is aligned to the given number of bytes.
   */
  alignTo (value: number, numberOfBytes: number): number {
    const rem = value % numberOfBytes;
    return rem === 0 ? value : value + (numberOfBytes - rem);
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


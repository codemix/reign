/* @flow */

import type Backing from "backing";

type Addressable = {
  [symbol: Symbol]: any;
};

declare class TypedEntity {
  static [symbol: Symbol]: any;
  static id: uint32;
  static name: string;
  static byteLength: uint32;
  static byteAlignment: uint32;
}

declare class TypedPrimitive<T> extends TypedEntity {
  static [symbol: Symbol]: any;
  static cast (input: any): T;
  static accepts (input: any): boolean;
  static initialize (backing: Backing, address: float64, initialValue?: T): void;
  static store (backing: Backing, address: float64, value: T): void;
  static load (backing: Backing, address: float64): T;
  static clear (backing: Backing, address: float64): void;
  static destructor (backing: Backing, address: float64): void;
  static emptyValue (): T;
  static randomValue (): T;
  static hashValue (input: T): uint32;
  static equal (valueA: TypedPrimitive<T>, valueB: TypedPrimitive<T>): boolean;
  static compareValues (valueA: T, valueB: T): int8;
  static compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8;
  static compareAddressValue (backing: Backing, address: float64, value: T): int8;
  static Array: Class<TypedArray<T>>;
}

declare class TypedReference<T> extends TypedEntity {
  static [symbol: Symbol]: any;
  static cast (input: any): T;
  static accepts (input: any): boolean;
  static initialize (backing: Backing, address: float64, initialValue?: T): void;
  static store (backing: Backing, address: float64, value: T): void;
  static load (backing: Backing, address: float64): T;
  static clear (backing: Backing, address: float64): void;
  static destructor (backing: Backing, address: float64): void;
  static emptyValue (): T;
  static randomValue (): T;
  static hashValue (input: T): uint32;
  static equal (valueA: T, valueB: T): boolean;
  static compareValues (valueA: T, valueB: T): int8;
  static compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8;
  static compareAddressValue (backing: Backing, address: float64, value: T): int8;
  static Array: Class<TypedArray<ReferenceType<T>>>;
}

declare class TypedArray<E> extends TypedEntity {
  @@iterator(): Iterator<E>;
  static [symbol: Symbol]: any;
  static cast (input: any): TypedArray<E>;
  static accepts (input: any): boolean;
  static initialize (backing: Backing, address: float64, initialValue?: E): void;
  static store (backing: Backing, address: float64, value: E[]|TypedArray<E>): void;
  static load (backing: Backing, address: float64): TypedArray<E>;
  static clear (backing: Backing, address: float64): void;
  static destructor (backing: Backing, address: float64): void;
  static emptyValue (): TypedArray<E>;
  static randomValue (): TypedArray<E>;
  static hashValue (input: TypedArray<E>): uint32;
  static equal (valueA: TypedArray<E>|E[], valueB: TypedArray<E>|E[]): boolean;
  static compareValues (valueA: TypedArray<E>|E[], valueB: TypedArray<E>|E[]): int8;
  static compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8;
  static compareAddressValue (backing: Backing, address: float64, value: TypedArray<E>|E[]): int8;
  static Array: Class<TypedArray<TypedArray<E>>>;
  static BYTES_PER_ELEMENT: uint32;
  static ref: ReferenceType<TypedArray<E>>;
}

declare class TypedHashMap<K, V> extends TypedEntity {
  @@iterator(): Iterator<[K, V]>;
  static [symbol: Symbol]: any;

  static cast (input: any): TypedHashMap<K, V>;
  static accepts (input: any): boolean;
  static initialize (backing: Backing, address: float64, initialValue?: Object|Map): void;
  static store (backing: Backing, address: float64, value: Object|Map|TypedHashMap<K, V>): void;
  static load (backing: Backing, address: float64): TypedHashMap<K, V>;
  static clear (backing: Backing, address: float64): void;
  static destructor (backing: Backing, address: float64): void;
  static emptyValue (): TypedHashMap<K, V>;
  static randomValue (): TypedHashMap<K, V>;
  static hashValue (input: TypedHashMap<K, V>|Map<K, V>|{[key: K]: V}): uint32;
  static equal (valueA: TypedHashMap<K, V>, valueB: TypedHashMap<K, V>): boolean;
  static compareValues (valueA: TypedHashMap<K, V>, valueB: TypedHashMap<K, V>): int8;
  static compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8;
  static compareAddressValue (backing: Backing, address: float64, value: TypedHashMap<K, V>): int8;
  static Array: Class<ArrayType<TypedHashMap<K, V>>>;
  static ref: ReferenceType<TypedHashMap<K, V>>;
}

declare class TypedStruct<S> extends TypedEntity {
  static [symbol: Symbol]: any;
  static cast (input: any): TypedStruct<S>;
  static accepts (input: any): boolean;
  static initialize (backing: Backing, address: float64, initialValue?: S|TypedStruct<S>): void;
  static store (backing: Backing, address: float64, value: S|TypedStruct<S>): void;
  static load (backing: Backing, address: float64): TypedStruct<S>;
  static clear (backing: Backing, address: float64): void;
  static destructor (backing: Backing, address: float64): void;
  static emptyValue (): TypedStruct<S>;
  static randomValue (): TypedStruct<S>;
  static hashValue (input: TypedStruct<S>|S): uint32;
  static equal (valueA: TypedStruct<S>|S, valueB: TypedStruct<S>|S): boolean;
  static compareValues (valueA: TypedStruct<S>|S, valueB: TypedStruct<S>|S): int8;
  static compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8;
  static compareAddressValue (backing: Backing, address: float64, value: TypedStruct<S>|S): int8;
  static Array: Class<ArrayType<TypedStruct<S>>>;
  static ref: ReferenceType<TypedStruct<S>>;
}

declare class TypedObject<S> extends TypedEntity {
  static [symbol: Symbol]: any;
  static cast (input: any): TypedObject<S>;
  static accepts (input: any): boolean;
  static initialize (backing: Backing, address: float64, initialValue?: S|TypedObject<S>): void;
  static store (backing: Backing, address: float64, value: S|TypedObject<S>): void;
  static load (backing: Backing, address: float64): TypedObject<S>;
  static clear (backing: Backing, address: float64): void;
  static destructor (backing: Backing, address: float64): void;
  static emptyValue (): TypedObject<S>;
  static randomValue (): TypedObject<S>;
  static hashValue (input: TypedObject<S>|S): uint32;
  static equal (valueA: TypedObject<S>|S, valueB: TypedObject<S>|S): boolean;
  static compareValues (valueA: TypedObject<S>|S, valueB: TypedObject<S>|S): int8;
  static compareAddresses (backing: Backing, addressA: float64, addressB: float64): int8;
  static compareAddressValue (backing: Backing, address: float64, value: TypedObject<S>|S): int8;
  static Array: Class<ArrayType<TypedObject<S>>>;
  static ref: ReferenceType<TypedObject<S>>;
}

declare type PrimitiveType<T> = Class<TypedPrimitive<T>>;
declare type ReferenceType<T> = Class<TypedReference<T>>;
declare type ArrayType<E> = Class<TypedArray<E>>;
declare type HashMapType<K, V> = Class<TypedHashMap<K, V>>;
declare type StructType<S> = Class<TypedStruct<S>>;
declare type ObjectType<S> = Class<TypedObject<S>>;

declare type Type = Class<
    TypedPrimitive<any>
  | TypedReference<any>
  | TypedArray<any>
  | TypedHashMap<any, any>
  | TypedStruct<any>
  | TypedObject<Object>
>;

declare type PartialType<T> = {
  (...args: any[]): T;
  name: string;

  ref: ReferenceType<T>;
  Array: Class<ArrayType<T>>;
};

declare type TypeClass<T> = (...args: any[]) => T;

declare type StructField<T> = {
  name: string;
  offset: number;
  default: T;
  type: Type;
};
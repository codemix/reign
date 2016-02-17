/* @flow */

declare class TypedObject {

}

declare class Type<T> {
  constructor (...args: any[]): T;
  static id: uint32;
  static name: string;
}

declare type PartialType<T> = {
  (...args: any[]): T;
  name: string;
};

declare type TypeClass<T> = Class<Type<T>>;

declare type PrimitiveType<T> = Class<Type<T>>;

declare type StructField<T> = {
  name: string;
  offset: number;
  default: T;
  type: Type<T>|PartialType<T>;
};
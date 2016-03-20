# reign
Persistent, typed objects for JavaScript.

[![Build Status](https://travis-ci.org/codemix/reign.svg?branch=master)](https://travis-ci.org/codemix/reign)

## What?

Provides a realm (like a namespace) which can contain various kinds of typed object, and mechanisms for
storing and loading those objects to disk.

Currently supports various kinds of data type:

* [Arrays](./src/type-class/array-type)
* [HashMaps](./src/type-class/hash-map-type)
* [HashSets](./src/type-class/hash-set-type)
* [Objects](./src/type-class/object-type)
* [Primitives](./src/type-class/primitive-type)
* [References](./src/type-class/reference-type)
* [Strings](./src/type-class/string-type)
* [Structs](./src/type-class/struct-type)
* [Enums](./src/type-class/enum-type)
* [Unions](./src/type-class/union-type)

As well as the following builtins:

* [T.Any](./src/builtins/any)
* [T.Array](./src/builtins/array)
* [T.Boolean](./src/builtins/boolean)
* [T.Int8](./src/builtins/int8)
* [T.Int16](./src/builtins/int16)
* [T.Int32](./src/builtins/int32)
* [T.Uint8](./src/builtins/uint8)
* [T.Uint16](./src/builtins/uint16)
* [T.Uint32](./src/builtins/uint32)
* [T.Float32](./src/builtins/float32)
* [T.Float64](./src/builtins/float64)
* [T.HashMap](./src/builtins/hash-map)
* [T.HashSet](./src/builtins/hash-set)
* [T.Object](./src/builtins/object)
* [T.String](./src/builtins/string)
* [T.InternedString](./src/builtins/interned-string)


## Examples

See the [examples](./examples) directory.

## API Documentation

Currently very work in progress, see [src/README.md](./src/README.md).

## Installation

Install via [npm](https://npmjs.org/package/reign).
```sh
npm install reign
```

## Usage
See the [API documentation](./src/README.md#usage).


## License

Published by [codemix](http://codemix.com/) under a permissive MIT License, see [LICENSE.md](./LICENSE.md).

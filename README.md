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
```js
var Backing = require('backing');
var Realm = require('reign').Realm;

var backing = new Backing({
  name: 'example',
  arenaSize: 1024 * 1024,
  arenaSource: {
    type: 'mmap', // can also be 'array-buffer' to use storage which will not survive program termination.
    dirname: __dirname + '/../data'
  }
});

var realm = new Realm(backing);

// `T` is an object containing all the registered types in the realm, e.g. `T.String` or `T.Object`.
var T = realm.T;

var StructType = realm.StructType;

// Initialize the realm, loading the data files. (Returns a promise)
realm.init().then(function () {
  const Thing = new StructType({
    id: T.Uint32,
    name: T.String,
    description: T.String,
    extra: T.Object // Holds additional properties.
  });

  let thing = realm.get('London');
  if (!thing) {
    // This must be the first time we've run this program.
    thing = new Thing({
      id: 123,
      name: 'London',
      description: 'The city of london.',
      extra: {
        type: 'Place'
      }
    });
    console.log('Saving a new Thing called London');
    realm.set('London', thing);
  }
  else {
    console.log('Loaded an existing thing called London')
  }

  console.log(JSON.stringify(thing, null, 2));

  if (thing.extra.type !== 'City') {
    console.log('London is a city, not just a place.')
    thing.extra.type = 'City';
  }

});
```
Run this example more than once to see different results.

## License

Published by [codemix](http://codemix.com/) under a permissive MIT License, see [LICENSE.md](./LICENSE.md).

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

import Backing from "backing";
import {Realm} from "reign";

const backing = new Backing({
  name: 'demo',
  arenaSize: 16 * 1024 * 1024, // 16Mb, you should set this to the largest possible value for your environment, up to 2Gb.
  arenaSource: {
    type: 'mmap',
    dirname: __dirname + '/data'
  }
});

const realm = new Realm(backing);

async function run () {
  await realm.init();

  const {StructType, T} = realm;

  const Point = new StructType(
    {
      r: T.UInt8,
      g: T.UInt8,
      b: T.UInt8,
      a: T.UInt8
    },
    {
      defaults: {
        a: 255
      }
    }
  );

  const Column = new StructType(Point, 1024);

  const Screen = new StructType(Column, 768);


  const display = new Screen();

  display[10][10].r = 127;

  const User = new StructType({
    name: T.String,
    screen: Screen.ref // Store references to screens, don't embed them
  });

  const user = new User({
    name: "Alice",
    screen: display
  });

  console.log(user.display[10][10].r);
}

run();

```


## License

Published by [codemix](http://codemix.com/) under a permissive MIT License, see [LICENSE.md](./LICENSE.md).

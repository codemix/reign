# type-realm
A realm for typed objects.

[![Build Status](https://travis-ci.org/codemix/type-realm.svg?branch=master)](https://travis-ci.org/codemix/type-realm)

## What?

## API Documentation

Currently very work in progress, see [src/README.md](./src/README.md).

## Installation

Install via [npm](https://npmjs.org/package/type-realm).
```sh
npm install type-realm
```

## Usage

```js

import Backing from "backing";
import TypeRealm from "type-realm";

const backing = new Backing({
  name: 'demo',
  arenaSize: 16 * 1024 * 1024, // 16Mb, set to the largest possible value for your environment, up to 2Gb.
  arenaSource: {
    type: 'mmap',
    dirname: __dirname + '/data'
  }
});

const realm = new TypeRealm(backing);

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

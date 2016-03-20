# Realm

A realm is a namespace which can contain various kinds of types and their instances, along with different kinds of value.

* [Builtin Types](./builtins)
* [Hash Functions](./hash-functions)
* [Type Classes](./type-class)
* [String Pool](./string-pool)
* [Utility Functions](./util)


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
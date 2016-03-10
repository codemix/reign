# StructType

A type class which can create object types with fixed layouts. Takes an object or array of fields as input and produces a type which can store objects with that shape.

Usage:

```js
const {StructType, T} = realm;

const Thing = new StructType({
  name: T.String
});

const User = new StructType({
  name: T.String,
  likes: Thing.ref.Array
});

const things = new Thing.Array([
  {
    name: 'Shopping'
  },
  {
    name: 'Eating Cake'
  },
  {
    name: 'Reading'
  },
  {
    name: 'Football'
  }
]);

const alice = new User({
  name: 'Alice',
  likes: [things[0], things[1], things[2]]
});

console.log(alice.likes[0].name);
```
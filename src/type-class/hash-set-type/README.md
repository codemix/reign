# HashSetType

A type class for typed hash sets. Takes an element type as input and produces a hash set type which can store elements of that type.

Usage:

```js
const {HashSetType, T} = realm;

const StringSet = new HashSetType(T.String);

const set = new StringSet();

set.add('hello world');
set.add('foo bar');

set.has('hello world'); // true

for (const entry of set) {
  console.log(entry);
}

set.delete('foo bar');
```
# HashMapType

A type class for typed hash maps. Takes a key type and a value type as input and produces a hash map type which can store key / values of those types.

> Note: These hash maps use open addressing and do not guarantee any particular ordering when iterating their keys / values.

Usage:

```js
const {HashMapType, T} = realm;

const StringMap = new HashMapType(T.String, T.String);

const map = new StringMap();

map.set('hello', 'world');

console.log(map.get('hello'));
```
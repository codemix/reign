# HashMapType

A type class for typed hash maps. Takes a key type and a value type as input and produces a hash map type which can store key / values of those types.

Usage:

```js
const {HashMapType, T} = realm;

const StringMap = new HashMapType(T.String, T.String);

const map = new StringMap();

map.set('hello', 'world');

console.log(map.get('hello'));
```
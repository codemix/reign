# Hash Map

Generic hash map type allowing [any](../any) serialiable input as key / value.

```js
const map = new T.HashMap();

map.set('hello', 'world');
map.set(123, 456);
map.set(true, false);

console.log(map.get('hello'));
console.log(map.get(123));
console.log(map.get(true));
```
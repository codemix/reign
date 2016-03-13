# Hash Set

Generic hash set type allowing [any](../any) serialiable input.

```js
const set = new T.HashSet();

set.add('hello');
set.add(123);
set.add(true);

console.log(set.has('hello'));
console.log(set.has(123));
console.log(set.has(true));
```
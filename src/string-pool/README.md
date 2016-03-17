# String Pool

Holds a list of [interned](https://en.wikipedia.org/wiki/String_interning) strings in an internal hash map.
Is used by the [T.InternedString](../builtin/interned-string) builtin type to ensure that only a single copy of a string is stored.

Usage:

```js

const {strings} = realm;

// check whether a string is in the pool

strings.has('foo'); // false

// explicitly add a string to the pool.

const address = strings.add('foo');

console.log(address); // the address of the newly created string.

strings.has('foo'); // true

strings.add('foo') === address; // returns the address of the existing string, incrementing the refcount

strings.remove('foo'); // decrement the ref count.

strings.has('foo'); // still true

strings.remove('foo'); // decrement the ref count again, now we reached zero actually remove it from the pool.

strings.has('foo'); // now false

```
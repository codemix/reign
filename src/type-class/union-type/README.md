# UnionType

A type class for representing a union of different types.

Usage:

```js

const {StructType, UnionType, T} = realm;

const GeoPoint = new StructType({
  longitude: T.Float64,
  latitude: T.Float64
});

// Location can be a GeoPoint or a String.
const Location = new UnionType(GeoPoint, T.String);

const User = new StructType({
  name: T.String,
  location: Location
});

const alice = new User({
  name: 'Alice',
  location: '123 Fake Street'
});

const bob = new User({
  name: 'Bob',
  location: {
    longitude: 12.34,
    latitude: 45.67
  }
});
```

Unions can also be allocated on their own. In this way they function as a kind of boxed value:

```js
const fakeStreet = new Location("123 Fake Street");
const somewhere = new Location({longitude: -12.34, latitude: 45.56})
const nowhere = new Location();

console.log(fakeStreet.value); // 123 Fake Street;
console.log(somewhere.value.longitude); // -12.34
console.log(nowhere.value); // null

fakeStreet.type === T.String; // true
somewhere.type === GeoPoint; // true
nowhere.type === null; // true
```

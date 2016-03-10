# ArrayType

Type class for fixed length typed arrays. Takes another Type as input and produces an array type for it.

Usage:

```js
const {ArrayType, T} = realm;
const NumberArray = new ArrayType(T.Float64);

const numbers = new NumberArray(3);

numbers[0] === 0;
numbers[1] === 0;
numbers[2] === 0;

numbers[1] = 123;

numbers.forEach(num => console.log(num));

```
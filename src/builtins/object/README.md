# Object Type

Represents simple, untyped objects. When an object is stored, it behaves as if [`Object.preventExtensions()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions) has been called on it - it is not possible to add further properties, but existing properties can be modified.

Usage:

```js

const {StructType, T} = realm;

const Element = new StructType({
  name: T.String,
  props: T.Object
});

const banner = new Element({
  name: 'Banner',
  props: {
    id: 'main-banner',
    className: 'jumbotron',
    nested: {
      as: {
        deep: {
          as: {
            you: {
              want: true
            }
          }
        }
      }
    }
  }
});

console.log(banner.props.className);

banner.props.className = 'jumbotron jumbotron-lg'; // ok

banner.props.nope = 'nope'; // has no effect, we can't add properties
typeof banner.props.nope === 'undefined'

```
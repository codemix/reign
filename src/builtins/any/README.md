# Any Type

`Any` can represent any kind of serializable value, (e.g. not a `Function` or `Symbol`).
It takes up 12 bytes of space aligned to 8 bytes. The structure looks like this:

    |--------------------------------------------|
    |         Value or Pointer (Float64)         |
    |--------------------------------------------|
    |             Type Tag (Uint32)              |
    ----------------------------------------------


If the value being stored can be represented in 8 bytes or less, it is stored inline, otherwise
space is allocated for the value separately and a pointer is stored.
# Interned String Type

Interned strings are stored in a [pool](../../string-pool/README.md), ensuring that a copy of any particular string is stored only once, and all further attempts to store the same string will return the existing copy's address.

Interned strings offer memory savings and faster exact comparisons compared to normal strings, at the expense of greater CPU usage when they are first created.

Structurally they share a similar implementation to the normal [String](../string/README.md) type.

Note that the number of strings that can be interned in total is constrained by the arena size. See the [string pool documentation](../../string-pool/README.md) for more information.
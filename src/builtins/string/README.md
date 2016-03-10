# String Type

Strings are length-and-hash-prefixed arrays of characters.
If the string is ascii compatible, each character is a Uint8 occupying a single byte.
If the string contains non-ascii characters, each character in the string is a Uint16, occupying two bytes.
To determine which type of string we're dealing with, we store a negative length for Uint16 arrays and a positive length for Uint8 arrays.
The length always refers to the array length and therefore the number of characters, rather than the number of bytes.

Strings layout:

    ---------------------------------------------
    |             Length: Int32                 | (If length is negative, the string is a Uint16 array.)
    ---------------------------------------------
    |               Hash: Uint32                |
    ---------------------------------------------
    |   Data: Uint8[](Length)|Uint16[](Length)  |
    ---------------------------------------------

Because they have dynamic lengths, strings are always stored by reference.
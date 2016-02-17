/* @flow */

/**
 * Hash a Buffer or Uint8Array and return the value.
 */
export default function hashBuffer (input: Buffer|Uint8Array): uint32 {
  let hash = 0;
  const length = input.length;
  for (let i = 0; i < length; i++) {
    hash = ((hash << 5) - hash) + input[i];
  }
  return hash >>> 0;
}

/**
 * Calculate a 32 bit FNV-1a hash
 */
export function fnv (input: Buffer|Uint8Array): uint32 {
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i++) {
      hash ^= input[i];
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

/**
 * Calculate a 32 bit DJB hash.
 */
export function djb (input: Buffer|Uint8Array): uint32 {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input[i];
  }
  return hash >>> 0;
}

/**
 * Calculate a 32 bit Murmur3 hash.
 */
export function murmur3 (key: Buffer|Uint8Array, seed: uint32 = 0): uint32 {
  let h1b, k1;

  const remainder = key.length & 3; // key.length % 4
  const bytes = key.length - remainder;
  let h1 = seed;
  let c1 = 0xcc9e2d51;
  let c2 = 0x1b873593;
  let i = 0;

  while (i < bytes) {
    k1 =
        ((key[i] & 0xff)) |
        ((key[++i] & 0xff) << 8) |
        ((key[++i] & 0xff) << 16) |
        ((key[++i] & 0xff) << 24);
    ++i;

    k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

    h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
    h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
    h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
  }

  k1 = 0;

  switch (remainder) {
    case 3: k1 ^= (key[i + 2] & 0xff) << 16;
    case 2: k1 ^= (key[i + 1] & 0xff) << 8;
    case 1: k1 ^= (key[i] & 0xff);

    k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}
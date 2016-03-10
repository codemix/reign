import hashString from '../string';
import hashFloat64 from '../float64';

export default function hashAny (input: any): uint32 {
  if (input == null) {
    return 4;
  };
  switch (typeof input) {
    case 'boolean':
      return input ? 3 : 5;
    case 'number':
      return hashFloat64(input);
    case 'string':
      return hashString(input);
    case 'object':
      return Array.isArray(input) ? hashArray(input) : hashObject(input);
    default:
      throw new TypeError(`Unsupported type: ${typeof input}`);
  }
}

export function hashArray (input: any[]): uint32 {
  const length = input.length;
  for (let i = 0; i < length; i++) {
    hash += i;
    hash ^= hashAny(input[i]);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

export function hashObject (input: Object): uint32 {
  const keys = Object.keys(input);
  let hash = 0x811c9dc5;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    hash += i;
    hash ^= hashString(key);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    hash ^= hashAny(input[key]);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}
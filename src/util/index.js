
/**
 * Ensure that the given value is aligned to the given number of bytes.
 */
export function alignTo (value: number, numberOfBytes: number): number {
  const rem = value % numberOfBytes;
  return rem === 0 ? value : value + (numberOfBytes - rem);
}
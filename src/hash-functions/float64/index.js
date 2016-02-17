/* @flow */

const buffer = new ArrayBuffer(8);
const uint32Array = new Uint32Array(buffer);
const float64Array = new Float32Array(buffer);

export default function hashFloat64 (input: float32): uint32 {
  float64Array[0] = input;
  return (uint32Array[0] + uint32Array[1]) >>> 0;
}
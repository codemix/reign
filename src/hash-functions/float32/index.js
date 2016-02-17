/* @flow */

const buffer = new ArrayBuffer(4);
const uint32Array = new Uint32Array(buffer);
const float32Array = new Float32Array(buffer);

export default function hashFloat32 (input: float32): uint32 {
  float32Array[0] = input;
  return uint32Array[0];
}
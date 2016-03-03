/* @flow */

export default function random (): string {
  return Math.random() > 0.7 ? multibyte() : ascii();
}

export function ascii (): string {
  const length: uint32 = Math.floor(Math.random() * 255);
  const chars: uint8[] = new Array(length);
  let seed = Math.round(Math.random() * 100000);

  for (let i = 0; i < length; i++) {
    seed = (seed + (i * 333)) % 127;
    if (seed < 32) {
      seed += 32;
    }
    chars[i] = seed;
  }

  return String.fromCharCode(...chars);
}


function multibyte (): string {
  const length: uint32 = Math.floor(Math.random() * 255);
  const chars: uint16[] = new Array(length);
  let seed = Math.round(Math.random() * 100000);

  for (let i = 0; i < length; i++) {
    seed = (seed + (i * 333)) % 512;
    if (seed < 32) {
      seed += 32;
    }
    chars[i] = seed;
  }

  return String.fromCharCode(...chars);
}
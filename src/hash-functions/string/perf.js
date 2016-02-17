// --trace-hydrogen --trace-phase=Z --trace-deopt --code-comments --hydrogen-track-positions --redirect-code-traces --redirect-code-traces-to=code.asm --print-opt-code

import {default as hashString, djb, fnv, murmur3} from "./";

const inputs = [
  "hello",
  "world",
  "hello world",
  "foo",
  "bar",
  "foo bar"
];

function once (): number {
  let total = 0;
  for (let i = 0; i < 6; i++) {
    const input = inputs[i];
    total += (hashString(input) % 256);
    total += (djb(input) % 256);
    total += (fnv(input) % 256);
    total += (murmur3(input) % 256);
  }
  return total;
}

function run (limit: number = 10000): number {
  let counter = 0;
  for (let i = 0; i < limit; i++) {
    counter += once();
  }
  return counter;
}

run();
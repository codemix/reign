import randomNumbers from "./random.json";

import {inspect} from "util";
global.dump = function dump (...args) {
  console.log(inspect(args.length > 1 ? args : args[0], {colors: true}))
};

global.jdump = function jdump (...args) {
  console.log(JSON.stringify(args.length > 1 ? args : args[0], null, 2))
};



ensureDeterministicRandom();


function ensureDeterministicRandom () {
  let index = 15;
  Math.random = function () {
    return randomNumbers[index++ % randomNumbers.length];
  };
}

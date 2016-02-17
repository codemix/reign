/* @flow */

import {forceInline} from "../../performance";

/**
 * From https://github.com/v8/v8/blob/master/src/js/collection.js
 */
export default function hashInteger (input: number): uint32 {
  let hash = input;
  hash = hash ^ 0;
  hash = ~hash + (hash << 15);
  hash = hash ^ (hash >>> 12);
  hash = hash + (hash << 2);
  hash = hash ^ (hash >>> 4);
  hash = (hash * 2057) | 0;
  hash = hash ^ (hash >>> 16);
  return hash & 0x3fffffff;
}

forceInline(hashInteger);
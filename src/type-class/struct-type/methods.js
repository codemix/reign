/* @flow */

import type Backing from "backing";

import {$Address, $CanBeEmbedded, $CanContainReferences} from "../../symbols";

/**
 * Creates a function which can initialize a new struct, either
 * via a config object or by using default (empty) field values.
 */
export function createInitializeStruct (Partial: PartialType<Object>, fields: StructField<any>[]): (backing: Backing, address: float64, input: ?Object) => void {
  const defaults = [];
  const setValues = fields.map((field, index) => {
    const {name, type, offset} = field;
    defaults.push(field.default);
    if (isValidIdentifier(name)) {
      return `
        type${index}.initialize(backing, address + ${offset}, (tmp = input.${name}) !== undefined ? tmp : defaults[${index}]());
      `;
    }
    else {
      const sanitizedName = JSON.stringify(name);
      return `
        type${index}.initialize(backing, address + ${offset}, (tmp = input[${sanitizedName}]) !== undefined ? tmp : defaults[${index}]());
      `;
    }
  }).join('');

  const setEmpty = fields.map(({name, type, offset}, index) => `
        type${index}.initialize(backing, address + ${offset}, defaults[${index}]());
  `).join('');

  const argNames = ['$Address', 'Partial', 'defaults', ...fields.map((_, index) => `type${index}`)];
  const args = [$Address, Partial, defaults, ...fields.map(field => field.type)];
  const body = `
    "use strict";
    return function initializeStruct (backing, address, input) {
      if (input == null) {
        ${setEmpty}
      }
      else if (input instanceof Partial) {
        backing.copy(address, input[$Address], Partial.byteLength);
      }
      else {
        var tmp;
        ${setValues}
      }
    };
  `;
  return (Function(...argNames, body))(...args);
}

/**
 * Creates a function which can write a struct, either
 * via a config object or by using default (empty) field values.
 */
export function createStoreStruct (Partial: PartialType<Object>, fields: StructField<any>[]): (backing: Backing, address: float64, input: ?Object) => void {
  const defaults = [];
  const setValues = fields.map((field, index) => {
    const {name, type, offset} = field;
    defaults.push(field.default);
    if (isValidIdentifier(name)) {
      return `
        type${index}.store(backing, address + ${offset}, (tmp = input.${name}) !== undefined ? tmp : defaults[${index}]);
      `;
    }
    else {
      const sanitizedName = JSON.stringify(name);
      return `
        type${index}.store(backing, address + ${offset}, (tmp = input[${sanitizedName}]) !== undefined ? tmp : defaults[${index}]);
      `;
    }
  }).join('');

  const setEmpty = fields.map(({name, type, offset}, index) => `
        type${index}.store(backing, address + ${offset}, defaults[${index}]);
  `).join('');

  const argNames = ['$Address', 'Partial', 'defaults', ...fields.map((_, index) => `type${index}`)];
  const args = [$Address, Partial, defaults, ...fields.map(field => field.type)];
  const body = `
    "use strict";
    return function storeStruct (backing, address, input) {
      if (input == null) {
        ${setEmpty}
      }
      else if (input instanceof Partial) {
        backing.copy(address, input[$Address], Partial.byteLength);
      }
      else {
        var tmp;
        ${setValues}
      }
    };
  `;
  return (Function(...argNames, body))(...args);
}

/**
 * Create the `.toJSON()` method for a list of fields.
 */
export function createToJSON (fields: StructField<any>[]): () => Object {
  return Function(`
    "use strict";
    return {
    ${fields.map(({name}) => {
      if (isValidIdentifier(name)) {
        return `${name}: this.${name}`;
      }
      else {
        const sanitizedName = JSON.stringify(name);
        return `${sanitizedName}: this[${sanitizedName}]`;
      }
    }).join(',\n      ')}
  };`);
}

/**
 * Create a function which can clear the given struct fields.
 */
export function createClearStruct (fields: StructField<any>[]): ?(backing: Backing, address: float64) => void {
  const clearable = fields.filter(({type}) => typeof type.clear === 'function');
  const clearers = clearable.map(field => field.type.clear);
  const names = clearable.map((_, index) => `clear_${index}`);
  const body = `
    "use strict";
    return function clearStruct (backing, address) {
      ${names
        .map((name, index) => `${name}(backing, address + ${clearable[index].offset});`)
        .join('\n        ')}
    };
  `;
  return Function(...names, body)(...clearers);
}


/**
 * Create a function which can destroy the given struct fields.
 */
export function createStructDestructor (fields: StructField<any>[]): ?(backing: Backing, address: float64) => void {
  const clearable = fields.filter(({type}) => {
    /* @flowIssue 252 */
    return type[$CanContainReferences] && typeof type.clear === 'function'
  });
  const clearers = clearable.map(field => field.type);
  const names = clearable.map((_, index) => `clearable_${index}`);
  const body = `
    "use strict";
    return function destructor (backing, address) {
      ${names
        .map((name, index) => `${name}.clear(backing, address + ${clearable[index].offset}); // ${clearable[index].name}`)
        .join('\n      ')}
    };
  `;
  console.log(body);
  return Function(...names, body)(...clearers);
}


/**
 * Create a function which can compare two structs by address.
 */
export function createCompareAddresses (fields: StructField<any>[]): (a: float64, b: float64) => int8 {
  const checkAddresses = fields.map(({offset}, index) => {
    return `
        else if ((tmp = type${index}.compareAddresses(backing, a + ${offset}, b + ${offset})) !== 0) {
          return tmp;
        }
    `;
  }).join('');
  const argNames: string[] = fields.map((_, index) => `type${index}`);
  const args = fields.map(({type}) => type);
  const body = `
      "use strict";
      return function compareAddresses (backing, a, b) {
        var tmp;

        if (a === b) {
          return 0;
        }
        else if (a === 0) {
          return -1;
        }
        else if (b === 0) {
          return 1;
        }
        ${checkAddresses}
        else {
          return 0;
        }
      };
  `;
  return (Function(...argNames, body))(...args);
}

/**
 * Create a function which can determine whether two structs are structurally equal.
 */
export function createEqual (fields: StructField<any>[]): (a: Object, b: Object) => boolean {
  const checkValues = fields.map(({name}, index) => {
    if (isValidIdentifier(name)) {
      return `
        else if (!type${index}.equal(a.${name}, b.${name})) {
          return false;
        }
      `;
    }
    else {
      const sanitizedName = JSON.stringify(name);
      return `
        else if (!type${index}.equal(a[${sanitizedName}], b[${sanitizedName}])) {
          return false;
        }
      `;
    }
  }).join('');
  const argNames = fields.map((_, index) => `type${index}`);
  const args = fields.map(({type}) => type);
  const body = `
      "use strict";
      return function equal (a, b) {
        if (a === b) {
          return true;
        }
        else if (a == null || b == null) {
          return false;
        }
      ${checkValues}
        else {
          return true;
        }
      };
  `;
  return ((Function(...argNames, body))(...args): ((a: Object, b: Object) => boolean));
}


/**
 * Create a function which can compare two struct instances.
 */
export function createCompareValues (fields: StructField<any>[]): (a: Object, b: Object) => int8 {
  const checkValues = fields.map(({name}, index) => {
    if (isValidIdentifier(name)) {
      return `
        else if ((tmp = type${index}.compareValues(a.${name}, b.${name})) !== 0) {
          return tmp;
        }
      `;
    }
    else {
      const sanitizedName = JSON.stringify(name);
      return `
        else if ((tmp = type${index}.compareValues(a[${sanitizedName}], b[${sanitizedName}])) !== 0) {
          return tmp;
        }
      `;
    }
  }).join('');
  const argNames = fields.map((_, index) => `type${index}`);
  const args = fields.map(({type}) => type);
  const body = `
      "use strict";
      return function compareValues (a, b) {
        var tmp;
        if (a === b) {
          return 0;
        }
        else if (a == null) {
          return -1;
        }
        else if (b == null) {
          return 1;
        }
      ${checkValues}
        else {
          return 0;
        }
      };
  `;
  return ((Function(...argNames, body))(...args): ((a: Object, b: Object) => int8));
}


/**
 * Create a function which can compare a struct stored at a given address with a given value.
 */
export function createCompareAddressValue (fields: StructField<any>[]): (backing: Backing, address: float64, value: ?Object) => int8 {
  const checkAddressValues = fields.map(({name, offset}, index) => {
    if (isValidIdentifier(name)) {
      return `
        else if ((tmp = type${index}.compareAddressValue(backing, address + ${offset}, value.${name})) !== 0) {
          return tmp;
        }
      `;
    }
    else {
      const sanitizedName = JSON.stringify(name);
      return `
        else if ((tmp = type${index}.compareAddressValue(backing, address, value[${sanitizedName}])) !== 0) {
          return tmp;
        }
      `;
    }
  }).join('');
  const argNames: string[] = fields.map((_, index) => `type${index}`);
  const args = fields.map(({type}) => type);
  const body = `
      "use strict";
      return function compareAddressValue (backing, address, value) {
        var tmp;
        if (value == null || typeof value !== 'object') {
          return 1;
        }
        else if (value[$Address] === address) {
          return 0;
        }
        ${checkAddressValues}
        else {
          return 0;
        }
      };
  `;
  return (Function('$Address', ...argNames, body))($Address, ...args);
}

/**
 * Create a function which can hash structs with the given fields.
 */
export function createHashStruct (fields: StructField<any>[]): (input: Object) => uint32 {
  const checkValues = fields.map(({name, type}, index) => {
    if (isValidIdentifier(name)) {
      return `
        hash ^= type${index}.hashValue(input.${name});
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      `;
    }
    else {
      const sanitizedName = JSON.stringify(name);
      return `
        hash ^= type${index}.hash(input[${sanitizedName}]);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      `;
    }
  }).join('');
  const argNames = fields.map((_, index) => `type${index}`);
  const args = fields.map(({type}) => type);
  const body = `
      "use strict";
      return function hashStruct (input) {
        var hash = 0x811c9dc5;

      ${checkValues}

        return hash >>> 0;
      };
  `;
  return (Function(...argNames, body))(...args);
}

/**
 * Creates a function which can return random objects with the same shape as the struct.
 */
export function createRandomValue (fields: StructField<any>[]): (() => Object) {
  const properties = fields.map(({name}, index) => {
    if (isValidIdentifier(name)) {
      return `          ${name}: type${index}.randomValue()`;
    }
    else {
      const sanitizedName = JSON.stringify(name);
      return `          ${sanitizedName}: type${index}.randomValue()`;
    }
  }).join(',\n');
  const argNames = fields.map((_, index) => `type${index}`);
  const args = fields.map(({type}) => type);
  const body = `
    "use strict";
    return function randomValue () {
      return new this({
        ${properties}
      });
    };
  `;
  return ((Function(...argNames, body))(...args): (() => Object));
}

export function isValidIdentifier (name: string): boolean {
  return /^([A-Za-z_$])([A-Za-z_$0-9]*)$/.test(name);
}

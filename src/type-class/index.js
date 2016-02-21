/* @flow */

import type {Realm} from "../";

export class TypedObject {

}

import {$isType} from "../symbols";

/**
 * Make the TypeClass meta-class for the given realm.
 */
export function make (realm: Realm): Function {

  /**
   * TypeClass meta-class.
   */
  function TypeClass (name: string, inititalizer: Function) {

    function define (...args) {
      let config = inititalizer(...args);

      if (config instanceof TypeClass) {
        // @flowIssue 1138
        Object.setPrototypeOf(config, define.prototype);
        return config;
      }

      let constructor;

      function Target () {
        return constructor.apply(this, arguments);
      }

      if (typeof config === 'function') {
        config = config(Target);
      }

      const source = config.prototype || {};
      // @flowIssue 1138
      if (!TypedObject.prototype.isPrototypeOf(source) && isSimplePrototype(Object.getPrototypeOf(source))) {
        // @flowIssue 1138
        Object.setPrototypeOf(source, TypedObject.prototype);
      }

      constructor = typeof config.constructor === 'function' ? config.constructor : function (input) {
        if (!(this instanceof Target)) {
          return input;
        }
      };


      Target.prototype = Object.create(source);
      Target.prototype.constructor = Target;

      // @flowIssue 1138
      Object.setPrototypeOf(Target, define.prototype);

      Object.keys(config).filter(name => name !== 'prototype' && name !== 'constructor').forEach(name => {
        Object.defineProperty(Target, name, {
          value: config[name]
        });
      });

      Object.defineProperty(Target, $isType, { value: true });

      return Target;
    }

    // @flowIssue 1138
    Object.setPrototypeOf(define, TypeClass.prototype);
    // @flowIssue 1138
    Object.setPrototypeOf(define.prototype, Function.prototype);


    Object.defineProperties(define, {
      name: {
        value: name
      }
    });

    return define;
  }

  // @flowIssue 1138
  Object.setPrototypeOf(TypeClass.prototype, Function.prototype);


  return TypeClass;
}

function isSimplePrototype (prototype: Object): boolean {
  return prototype == null || prototype === Object.prototype;
}

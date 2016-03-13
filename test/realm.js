import {Realm} from "../src";

function describeRealm (...args) {
  return runTest(describeBacking, ...args);
}

describeRealm.only = (...args) => runTest(describeBacking.only, ...args);
describeRealm.skip = (...args) => runTest(describeBacking.skip, ...args);

global.describeRealm = describeRealm;

function runTest (describe: Function, label: string, test: ?Function) {
  describe(label, function (options) {
    before(async () => {
      options.realm = new Realm(options.backing);
      await options.realm.init();
    });

    if (test) {
      test(options);
    }

  });
}


global.PRIMITIVE_NAMES = [
  'Int8',
  'Uint8',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64',
  'Boolean',
  //'String'
  //'any',
  //'string',
  //'indexedString'
];
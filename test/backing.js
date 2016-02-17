import Backing from "backing";

import path from "path";
import rimraf from "rimraf";
import Bluebird from "bluebird";

const rm = Bluebird.promisify(rimraf);

function describeBacking (...args) {
  return runTest(describe, ...args);
}

describeBacking.only = (...args) => runTest(describe.only, ...args);
describeBacking.skip = (...args) => runTest(describe.skip, ...args);

global.describeBacking = describeBacking;

function runTest (describe: Function, label: string, test: ?Function) {
  describe(label, function () {
    const name = testLabelToFileName(label);
    const dirname = path.resolve(__dirname, '..', 'data', name);
    const arenaSize = 2 * 1024 * 1024; // 2 Mb
    const options = {
      backing: null
    };

    before(async () => {
      options.backing = new Backing({
        name,
        arenaSize,
        arenaSource: {
          type: 'mmap',
          dirname
        }
      });

      await options.backing.init();
    });

    if (test) {
      test(options);
    }

    after(async () => {
      while (options.backing.arenas.length) {
        const arena = options.backing.arenas.pop();
        arena.buffer = null;
      }

      await rm(dirname);
    });

  });
}

if (typeof gc === 'function') {
  after(gc);
}

function testLabelToFileName (testLabel: string): string {
  return testLabel.replace(/\W+/g, '_');
}
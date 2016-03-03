import Bluebird from "bluebird";

global.benchmark = function benchmark (name, limit, ...fns) {
  let factor = 1;
  if (typeof limit === 'function') {
    fns.unshift(limit);
    limit = 1000;
  }
  if (typeof fns[0] === 'number') {
    factor = fns.shift();
  }
  it(`benchmark: ${name}`, benchmarkRunner(name, limit, factor, flattenBenchmarkFunctions(fns)));
};

global.benchmark.skip = function skipBenchmark (name) {
  it.skip(`benchmark: ${name}`);
}

global.benchmark.only = function benchmark (name, limit, ...fns) {
  let factor = 1;
  if (typeof limit !== 'number') {
    fns.unshift(limit);
    limit = 1000;
  }
  if (typeof fns[0] === 'number') {
    factor = fns.shift();
  }
  it.only(`benchmark: ${name}`, benchmarkRunner(name, limit, factor, flattenBenchmarkFunctions(fns)));
};


function benchmarkRunner (name, limit, factor, fns) {
  if (process.env.NODE_ENV === "coverage") {
    limit = 1;
  }
  else if (process.env.TEST_MODE === "fast") {
    limit = Math.ceil(limit / 100);
  }
  return async function () {
    this.timeout(10000);
    console.log(`\tStarting benchmark: ${name}\n`);
    let fastest = {
      name: null,
      score: null
    };
    let slowest = {
      name: null,
      score: null
    };
    await Bluebird.each(fns, async ([name,fn]) => {
      const start = process.hrtime();
      for (let j = 0; j < limit; j++) {
        const result = fn(j, limit);
        if (result && typeof result.then === 'function') {
          await result;
        }
      }
      let [seconds, ns] = process.hrtime(start);
      seconds += ns / 1000000000;
      const perSecond = Math.round(limit / seconds) * factor;
      if (fastest.score === null || fastest.score < perSecond) {
        fastest.name = name;
        fastest.score = perSecond;
      }
      if (slowest.score === null || slowest.score > perSecond) {
        slowest.name = name;
        slowest.score = perSecond;
      }
      console.log(`\t${name} benchmark done in ${seconds.toFixed(4)} seconds, ${perSecond} operations per second.`);
    });
    if (fns.length > 1) {
      const diff = (fastest.score - slowest.score) / slowest.score * 100;
      console.log(`\n\t${fastest.name} was ${diff.toFixed(2)}% faster than ${slowest.name}`);
    }
  };
}

function flattenBenchmarkFunctions (fns: Array<Object|Function>): Array {
  return fns.reduce((flat, item, index) => {
    if (typeof item === "object") {
      flat.push(...Object.keys(item).map(name => [name, item[name]]));
    }
    else {
      flat.push([item.name || "fn" + index, item]);
    }
    return flat;
  }, []);
}

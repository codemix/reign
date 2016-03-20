// Example: Simple Structs
// Defines a struct type and uses it to record the last time the example was run, along with
// the number of times the example has run in total.

// Require our dependencies.
var Backing = require('backing');
var Realm = require('../').Realm;

// Define our backing store.
// Realms need somewhere to store their data
var backing = new Backing({
  // The name which identifies the store.
  // This will form part of the filename for the database files.
  name: 'example-simple',
  // The size of each arena. This is the number of bytes which will
  // be preallocated at a time. In this example we're using 1 Mb
  // but in production you should almost always set this to the largest
  // possible value - 2Gb.
  arenaSize: 1024 * 1024,
  // The configuration for the arena source, which is responsible
  // for loading data files and allocating new arenas when we run out of space.
  arenaSource: {
    // The type or arenas this source provides.
    // This can be either 'mmap' or 'array-buffer'.
    // When using 'array-buffer', the data will be stored in memory
    // and not persisted to disk.
    type: 'mmap',
    // The name of the folder containing the data files.
    // This only applies to 'mmap' and will cause an error if `type` is set to 'array-buffer'.
    dirname: __dirname + '/../data'
  }
});

// Define our realm.
var realm = new Realm(backing);

// `T` is an object containing all the registered types in the realm, e.g. `T.String` or `T.Object`.
var T = realm.T;

// Structs are fixed-layout objects whose property names and corresponding types are predefined.
var StructType = realm.StructType;

// Define our types here so that we can export them later.
// (This is so that you can `require()` this file in a REPL).
var ExampleRun;

// Initialize the realm, loading the data files. (Returns a promise)
realm.init().then(function () {
  // Define a struct which can hold the time the example was last run, and the number of times it has
  // been run in total.
  ExampleRun = new StructType({
    // We'll just store the time as a string for simplicity.
    timestamp: T.String,
    // Holds the number of times the example has been run.
    // Note - if you run this example more than about 4 billion times, this value will overflow to zero.
    // For the purposes of the example this is probably safe, if you need a larger number value, use `T.Float64`.
    count: T.Uint32
  });

  // Export the ExampleRun type so that we can refer to it via REPL.
  exports.ExampleRun = ExampleRun;

  // Get the last run data, if it exists.
  var lastRun = realm.get('lastRun');

  if (!lastRun) {
    // If we didn't get a lastRun, this must be the first time we've run the example,
    // so define a new struct which contains the details.
    console.log("This is the first time we've run the example.")
    lastRun = new ExampleRun({
      timestamp: (new Date()).toString(),
      count: 1
    });

    // Set the "global" key.
    realm.set('lastRun', lastRun);
  }
  else {
    console.log("Last Run:", JSON.stringify(lastRun, null, 2))
    lastRun.timestamp = (new Date()).toString();
    lastRun.count++;
  }
  // Nothing left to do, so the process will exit.
});

// Export some variables for REPL convenience:
exports.realm = realm;
exports.backing = backing;

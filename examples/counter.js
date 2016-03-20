// Example: Counter.
// Displays the value of a key in the realm, increments it by one, and quits.
// Run the example repeatedly to see the number of times it has been run.

// Require our dependencies.
var Backing = require('backing');
var Realm = require('../').Realm;

// Define our backing store.
// Realms need somewhere to store their data
var backing = new Backing({
  // The name which identifies the store.
  // This will form part of the filename for the database files.
  name: 'example-counter',
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

// Initialize the realm, loading the data files. (Returns a promise)
realm.init().then(function () {
  // Get the number of times the example has been run.
  var count = realm.get('numberOfRuns') || 0;
  console.log('Number of runs:', count);
  // Increment the number of runs
  realm.set('numberOfRuns', count + 1);
  // Nothing left to do so the process will now end.
});

// Export some variables for REPL convenience:
exports.realm = realm;
exports.backing = backing;

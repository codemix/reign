// Example: Linked List
// Defines a singly-linked list using a simple struct. Uses the list to record the number of times
// the example has been run and when.

// Require our dependencies.
var Backing = require('backing');
var Realm = require('../').Realm;

// Define our backing store.
// Realms need somewhere to store their data
var backing = new Backing({
  // The name which identifies the store.
  // This will form part of the filename for the database files.
  name: 'example-linked-list',
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
var ListItem;

// Initialize the realm, loading the data files. (Returns a promise)
realm.init().then(function () {
  // Define a struct which can represent nodes in the list.
  // Since this type needs to be able to refer to itself, we delay finalization
  // in order to obtain a reference to the type to that the can use it in the type's own definition.
  ListItem = new StructType();
  ListItem.finalize({
    // We can store any value in our list.
    value: T.Any,
    // Store a reference to the next item in the list.
    // This can either be `null` or an instance of `ListItem`,
    // where `null` signals that this node is the end of the list.
    next: ListItem.ref
  });

  // Export the ListItem type so that we can refer to it via REPL.
  exports.ListItem = ListItem;

  // Get the first item in the list, if it exists.
  var item = realm.get('list');

  if (!item) {
    // If we didn't get an item, this must be the first time we've run the example,
    // so define a new node which represents the start of the list.
    item = new ListItem({value: ['First Item']});
    realm.set('list', item);
  }

  // For the purpose of our example, count the number of items in the list.
  var count = 1;

  console.log('First List Item:', JSON.stringify(item.value, null, 2));

  // Now walk through each item in the list, dumping it to the console.
  var next;
  while ((next = item.next)) {
    console.log('ListItem ' + count + ':', JSON.stringify(next.value, null, 2));
    item = next;
    count++;
  }

  // Add another item to the end of the list.
  item.next = {
    value: {
      count: count,
      time: (new Date()).toString()
    }
  };

  // Nothing left to do, so the process will exit.
});

// Export some variables for REPL convenience:
exports.realm = realm;
exports.backing = backing;

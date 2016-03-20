// Example: Users and Roles
// A more complicated example, we define some data structures to represent
// Users and Roles and the relationships between them.

// Require our dependencies.
var Backing = require('backing');
var Realm = require('../').Realm;

// Define our backing store.
// Realms need somewhere to store their data
var backing = new Backing({
  // The name which identifies the store.
  // This will form part of the filename for the database files.
  name: 'example-users-and-roles',
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
// HashSets are Sets of values which support very fast lookup operations but do not support in-order iteration.
var HashSetType = realm.HashSetType;
// HashMaps are Maps of key / values with support for very fast lookup operations but do not support in-order iteration.
var HashMapType = realm.HashMapType;

// Define our types here so that we can export them later.
// (This is so that you can `require()` this file in a REPL).
var User, Role, UserMap, RoleMap;

// Initialize the realm, loading the data files. (Returns a promise)
realm.init().then(function () {
  // `Role` and `User` need to be able to reference each other, because a `Role` has
  // many users and a `User` has many roles. This presents a problem though because
  // `User` has not been defined yet so there's no way for us to reference it.
  // The answer is to create `Role` but defer defining its layout until after `User` has been created.
  Role = new StructType();

  // Now we can define our `User` type.
  User = new StructType({
    // Users have names.
    name: T.String,
    // Holds whether or not the user is active.
    isActive: T.Boolean,
    // A set of roles that this user belongs to.
    // Note that we're using `Role.ref` rather than `Role` because we want to reference
    // a role rather than embedding it directly within this struct.
    // Note that if we did use `Role` heere, we would get a `TypeError` because the layout of `Role`
    // has not yet been defined.
    roles: new HashSetType(Role.ref)
  });

  // Now that `User` has been defined, we can finalize our `Role`'s layout.
  Role.finalize({
    // Roles have names.
    name: T.String,
    // A set of references to users that belong to this `Role`.
    users: new HashSetType(User.ref)
  });

  // Declare a type which can represent a map of strings to users.
  UserMap = new HashMapType(T.String, User);
  // Declare a type which can represent a map to strings to roles.
  RoleMap = new HashMapType(T.String, Role);

  // If this is the first time we've been run, create our test data,
  // or if the test data has been modfied, reset it to expected values.
  ensureCollectionsExist();
  ensureBuiltinRolesExist();
  ensureBuiltinUsersExist();

  // Get a refrence to the map of strings to users.
  var users = realm.get('users');
  // get a reference to the map of strings to roles
  var roles = realm.get('roles');

  // Dump what we know about the users.
  users.forEach((user, name) => {
    console.log(name, 'is an',(user.isActive ? 'active' : 'inactive'),'user who is a member of', Array.from(user.roles, role => role.name).join(', '))
  });

  // Export some variables for REPL convenience:
  exports.Role = Role;
  exports.User = User;
  exports.UserMap = UserMap;
  exports.RoleMap = RoleMap;

  exports.roles = roles;
  exports.users = users;
});

/**
 * Ensures that the users and roles collections exist.
 */
function ensureCollectionsExist () {
  if (!realm.has('users')) {
    realm.set('users', new UserMap());
  }
  if (!realm.has('roles')) {
    realm.set('roles', new RoleMap());
  }
}

/**
 * Ensures that the demo roles exist.
 */
function ensureBuiltinRolesExist () {
  addRole('admin');
  addRole('user');
  addRole('guest');
}

/**
 * Ensure that the demo users exist and have the right activation status.
 */
function ensureBuiltinUsersExist () {
  activate(addUser('Alice', ['admin', 'user']));
  activate(addUser('George', ['user']));
  deactivate(addUser('Bob', ['guest']));
}
/**
 * Add the role with the given name to the list, if it doesn't already exist.
 */
function addRole (name) {
  var roles = realm.get('roles');
  if (!roles.has(name)) {
    console.log('Adding role', name);
    roles.set(name, {name: name, users: []});
  }
  else {
    console.log('Role', name, 'already exists');
  }
}

/**
 * Add a new user with the given name and roles.
 */
function addUser (name, roleNames) {
  var users = realm.get('users');
  if (!users.has(name)) {
    console.log('Adding user', name);
    user = users.set(name, {
      name: name,
      roles: []
    });
  }
  else {
    console.log('Loading existing user', name);
  }
  var user = users.get(name);
  assignRoles(user, roleNames);
  return user;
}

/**
 * Assign the roles with the given names to the given user.
 */
function assignRoles (user, roleNames) {
  var roles = realm.get('roles');
  roleNames.forEach(function (roleName) {
    role = roles.get(roleName);
    role.users.add(user);
    user.roles.add(role);
  });
}

/**
 * Activate the given user.
 */
function activate (user) {
  user.isActive = true;
}

/**
 * Deactivate the given user.
 */
function deactivate (user) {
  user.isActive = false;
}

// Export some variables for REPL convenience:
exports.realm = realm;
exports.backing = backing;
exports.addRole = addRole;
exports.addUser = addUser;
exports.activate = activate;
exports.deactivate = deactivate;
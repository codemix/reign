# Examples

Contains a few thoroughly commented examples illustrating how to use the library.

* [simple](./simple.js) - Defines a struct type and uses it to record the last time the example was run, along with the number of times the example has run in total.
* [counter](./counter.js) - Displays the value of a key in the realm, increments it by one, and quits. Run the example repeatedly to see the number of times it has been run.
* [linked-list](./linked-list.js) - Defines a singly-linked list using a simple struct. Uses the list to record a list of the times the example has been run.
* [users-and-roles](./users-and-roles.js) - A more complicated example, we define some data structures to represent Users and Roles and the relationships between them.



## Running the examples

1. Checkout the repository and install the dependencies.
```sh
git clone https://github.com/codemix/reign.git
cd reign
npm install
```

2. Ensure you're using a recent-ish version of node, ideally 5+
```sh
node -v
```

3. Run each example from the CLI
```sh
node examples/simple.js
node examples/counter.js
node examples/linked-list.js
node examples/users-and-roles.js
```
Run the examples again to ensure that data has been successfully persisted. Files will be created in the [data](../data) directory (which will be created if it doesn't exist).
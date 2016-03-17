# EnumType

A type class for representing [enumerated values](https://en.wikipedia.org/wiki/Enumerated_type).

Enums efficiently represent a single value out of a predefined set. Unlike most types, they can store *any* kind of value, including symbols and functions. This is because they don't actually store values themselves, instead they store references.

Usage:

```js
const {EnumType, StructType, T} = realm;

const EmailStatus = new EnumType("read", "unread", "pending", "sent");

const inbox = {
  name: 'inbox'
};
const drafts = {
  name: 'drafts'
};
const outbox = {
  name: 'outbox'
};
const EmailContainer = new EnumType(inbox, drafts, outbox);

const Email = new StructType({
  subject: T.String,
  status: EmailStatus,
  container: EmailContainer,
  body: T.String
});

const message = new Email({
  subject: 'Hello World',
  status: 'pending',
  container: drafts,
  message: 'Hi.'
});

message.status = 'nope'; // TypeError - not in the list of allowed values.
message.status = 'sent';
message.container = outbox;
```

import {Realm} from "./";
import Backing from 'backing';

import {$Backing, $Address} from "./symbols";

describeRealm('Realm', function (options) {
  let realm;
  let other;
  let T;

  before(() => {
    realm = options.realm;
    T = realm.T;
  });

  it('should set a key / value', function () {
    realm.set('foo', 'bar');
  });

  it('should get a key / value', function () {
    realm.get('foo').should.equal('bar');
  });

  it('should load another copy of the realm', async function () {
    other = new Realm(new Backing(options.backingOptions));
    await other.init();
  });

  it('should get the key / value', function () {
    other.get('foo').should.equal('bar');
  });

  it('should share key / values across realm instances', function () {
    other.set('foo', 'baz');
    realm.set('obj', {a: 1, b: 2, c: 3});
    realm.get('foo').should.equal('baz');
    other.get('obj').should.eql({a: 1, b: 2, c: 3});
  });

});
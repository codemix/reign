describeRealm('Builtin', function (options) {
  let realm;
  let T;
  before(() => {
    realm = options.realm;
    T = realm.T;
  });

  it('should register the builtin types', function () {
    T.Int8.should.be.an.instanceOf(realm.PrimitiveType);
    T.Uint8.should.be.an.instanceOf(realm.PrimitiveType);
    //T.Number.should.be.an.instanceOf(realm.PrimitiveType);
  });

  it.skip('should clone T.Float64 to T.Number', function () {
    T.Number.name.should.equal('Number');
  });
});
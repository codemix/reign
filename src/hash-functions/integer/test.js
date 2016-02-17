import hashInteger from "./";

describe('Integer Hashes', function () {
  it(`should hash integer values`, function () {
    Array.from({length: 4096}, (_, index) => index).forEach(value => {
      const result = hashInteger(value);
      result.should.equal(Math.floor(result));
      result.should.be.above(-1);
      result.should.be.below(Math.pow(2, 32) - 1);
    });
  });

  benchmark("Default", 1000000, {
    integer () {
      return hashInteger(Math.random() * Math.pow(2, 32));
    }
  });
});
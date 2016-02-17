import hashFloat32 from "./";

describe('Float32 Hashes', function () {
  it(`should hash integer values`, function () {
    Array.from({length: 4096}, (_, index) => index).forEach(value => {
      const result = hashFloat32(value);
      result.should.equal(Math.floor(result));
      result.should.be.above(-1);
      result.should.be.below(Math.pow(2, 32) - 1);
    });
  });
  it('should hash float values', function () {
    Array.from({length: 4096}, (_, index) => index).forEach(value => {
      const result = hashFloat32(value * Math.random());
      result.should.equal(Math.floor(result));
      result.should.be.above(-1);
      result.should.be.below(Math.pow(2, 32) - 1);
    });
  });

  benchmark("Default", 1000000, {
    float32 () {
      return hashFloat32(Math.random() * Math.pow(2, 16));
    }
  });
});
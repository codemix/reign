import {default as hashBuffer, fnv, djb, murmur3} from "./";

describe('Buffer Hashes', function () {

  const bufs = Array.from({length: 10}, (_, index) => new Buffer(`foo bar ${index}`));

  it('should hash a buffer value using the default hash function', function () {
    const input = new Buffer("hello world");
    hashBuffer(input).should.eql(1794106052);
  });

  it('should hash a buffer value using the fnv hash function', function () {
    const input = new Buffer("hello world");
    fnv(input).should.eql(3582672807);
  });

  it('should hash a buffer value using the djb hash function', function () {
    const input = new Buffer("hello world");
    djb(input).should.eql(894552257);
  });

  it('should hash a buffer value using the murmur3 hash function', function () {
    const input = new Buffer("hello world");
    murmur3(input).should.eql(1586663183);
  });

  benchmark("Default vs DJB", 10000, {
    default () {
      return hashBuffer(bufs[4]);
    },
    djb () {
      return djb(bufs[4]);
    }
  });

  benchmark("Default vs Murmur3", 10000, {
    default () {
      return hashBuffer(bufs[4]);
    },
    murmur3 () {
      return murmur3(bufs[4]);
    }
  });

  benchmark("Default buffer hash vs FNV vs DJB", 10000, {
    default () {
      return hashBuffer(bufs[0]) +
             hashBuffer(bufs[1]) +
             hashBuffer(bufs[2]) +
             hashBuffer(bufs[3]) +
             hashBuffer(bufs[4]) +
             hashBuffer(bufs[5]) +
             hashBuffer(bufs[6]) +
             hashBuffer(bufs[7]) +
             hashBuffer(bufs[8]) +
             hashBuffer(bufs[9]);
    },
    fnv () {
      return fnv(bufs[0]) +
             fnv(bufs[1]) +
             fnv(bufs[2]) +
             fnv(bufs[3]) +
             fnv(bufs[4]) +
             fnv(bufs[5]) +
             fnv(bufs[6]) +
             fnv(bufs[7]) +
             fnv(bufs[8]) +
             fnv(bufs[9]);
    },
    djb () {
      return djb(bufs[0]) +
             djb(bufs[1]) +
             djb(bufs[2]) +
             djb(bufs[3]) +
             djb(bufs[4]) +
             djb(bufs[5]) +
             djb(bufs[6]) +
             djb(bufs[7]) +
             djb(bufs[8]) +
             djb(bufs[9]);
    }
  });
});
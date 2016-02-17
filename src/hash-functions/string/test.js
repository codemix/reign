import {default as hashString, fnv, djb, murmur3} from "./";
import {default as hashBuffer} from "../buffer";

describe('String Hashes', function () {
  const buf = new Buffer("hello worldy");

  it('should hash a string value using the default hash function', function () {
    const input = "hello world";
    hashString(input).should.eql(1794106052);
  });

  it('should hash a string value using the fnv hash function', function () {
    const input = "hello world";
    fnv(input).should.eql(3582672807);
  });

  it('should hash a string value using the djb hash function', function () {
    const input = "hello world";
    djb(input).should.eql(894552257);
  });

  it('should hash a string value using the murmur3 hash function', function () {
    const input = "hello world";
    murmur3(input).should.eql(1586663183);
  });

  benchmark("Default vs DJB", 10000, {
    default () {
      return hashString("hello worldy");
    },
    djb () {
      return djb("hello worldy");
    }
  });

  benchmark("Default vs Murmur3", 10000, {
    default () {
      return hashString("hello worldy");
    },
    murmur3 () {
      return murmur3("hello worldy");
    }
  });

  benchmark("FNV vs Murmur3", 10000, {
    fnv () {
      return fnv("hello worldy");
    },
    murmur3 () {
      return murmur3("hello worldy");
    }
  });

  benchmark("String vs Buffer", 100000, {
    string () {
      return hashString("hello worldy");
    },
    buffer () {
      return hashBuffer(buf);
    }
  });

  benchmark("Default string hash vs FNV vs DJB", 10000, {
    default () {
      return hashString("foo bar 0") +
             hashString("foo bar 1") +
             hashString("foo bar 2") +
             hashString("foo bar 3") +
             hashString("foo bar 4") +
             hashString("foo bar 5") +
             hashString("foo bar 6") +
             hashString("foo bar 7") +
             hashString("foo bar 8") +
             hashString("foo bar 9");
    },
    fnv () {
      return fnv("foo bar 0") +
             fnv("foo bar 1") +
             fnv("foo bar 2") +
             fnv("foo bar 3") +
             fnv("foo bar 4") +
             fnv("foo bar 5") +
             fnv("foo bar 6") +
             fnv("foo bar 7") +
             fnv("foo bar 8") +
             fnv("foo bar 9");
    },
    djb () {
      return djb("foo bar 0") +
             djb("foo bar 1") +
             djb("foo bar 2") +
             djb("foo bar 3") +
             djb("foo bar 4") +
             djb("foo bar 5") +
             djb("foo bar 6") +
             djb("foo bar 7") +
             djb("foo bar 8") +
             djb("foo bar 9");
    },
    murmur3 () {
      return murmur3("foo bar 0") +
             murmur3("foo bar 1") +
             murmur3("foo bar 2") +
             murmur3("foo bar 3") +
             murmur3("foo bar 4") +
             murmur3("foo bar 5") +
             murmur3("foo bar 6") +
             murmur3("foo bar 7") +
             murmur3("foo bar 8") +
             murmur3("foo bar 9");
    }
  });
});
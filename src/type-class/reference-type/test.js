import {Realm} from "../..";
import {Struct} from "./";

import {$Backing, $Address} from "../../symbols";

describeRealm('ReferenceType', function (options) {
  let realm;
  let StructType;
  let ReferenceType;
  let T;
  let Point, Series, Line;
  let series, line;

  before(() => {
    realm = options.realm;
    StructType = realm.StructType;
    ReferenceType = realm.ReferenceType;
    T = realm.T;
  });

  it('should create some structs', function () {
    Point = new StructType({
      x: T.Float64,
      y: T.Float64
    });

    Series = new StructType(Point, 100);

    Line = new StructType({
      from: Point.ref,
      to: Point.ref
    });
  });

  it('should create a line between two points', function () {
    line = new Line({
      from: {
        x: 10,
        y: 10
      },
      to: {
        x: 90,
        y: 90
      }
    });
  });

  it('should have created two new points', function () {
    line.from.should.be.an.instanceOf(Point);
    line.to.should.be.an.instanceOf(Point);
  });

  it('should create a series of points', function () {
    series = new Series();
  });

  it('should have 100 embedded points', function () {
    for (let i = 0; i < 100; i++) {
      series[i].should.be.an.instanceOf(Point);
    }
    (typeof series[100]).should.equal('undefined');
  });

  it('should not create a line between points embedded within a series', function () {
    (() => {
      new Line({from: series[0], to: series[99]});
    }).should.throw(ReferenceError);
  });
});
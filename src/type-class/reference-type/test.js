import {Realm} from "../..";
import {Struct} from "./";

import {$Backing, $Address} from "../../symbols";

describeRealm.skip('ReferenceType', function (options) {
  let realm;
  let StructType;
  let ReferenceType;
  let T;
  let Point, Series, Line;

  before(() => {
    realm = options.realm;
    StructType = realm.StructType;
    ReferenceType = realm.ReferenceType;
    T = realm.T;
  });

  it('should create some structs', function () {
    Point = new StructType('Point', {
      x: float64,
      y: float64
    });
    Series = new StructType(Point, 100);

    Line = new StructType({
      from: Point.ref,
      to: Point.ref
    });
  });
});
"use strict";

var Distance = require("./distance.js"),
    eudist = Distance.eudist,
    dist = Distance.dist;

module.exports = {
  kmrand: function kmrand(data, k) {
    var map = {},
        ks = [],
        t = k << 2;
    var len = data.length;
    var multi = data[0].length > 0;

    while (ks.length < k && t-- > 0) {
      var d = data[Math.floor(Math.random() * len)];
      var key = multi ? d.join("_") : "".concat(d);

      if (!map[key]) {
        map[key] = true;
        ks.push(d);
      }
    }

    if (ks.length < k) throw new Error("Error initializating clusters");else return ks;
  },

  /**
   * K-means++ initial centroid selection
   */
  kmpp: function kmpp(data, k, centroids) {
    var distance = eudist;
    var ks = centroids.filter(function (v) {
      return v.length > 0;
    }),
        len = data.length;
    var original_centroid_count = ks.length;
    var map = {}; // First random centroid, if we don't have any to begin with

    if (ks.length == 0) {
      var c = data[Math.floor(Math.random() * len)];
      ks.push(c);
    } // Retrieve next centroids


    while (ks.length < k) {
      // Min Distances between current centroids and data points
      var dists = [],
          lk = ks.length;
      var dsum = 0,
          prs = [];

      for (var i = 0; i < len; i++) {
        var min = Infinity;

        for (var j = 0; j < lk; j++) {
          var _dist = distance(data[i], ks[j]);

          if (_dist <= min) min = _dist;
        }

        dists[i] = min;
      } // Sum all min distances


      for (var _i = 0; _i < len; _i++) {
        dsum += dists[_i];
      } // Probabilities and cummulative prob (cumsum)


      for (var _i2 = 0; _i2 < len; _i2++) {
        prs[_i2] = {
          i: _i2,
          v: data[_i2],
          pr: dists[_i2] / dsum,
          cs: 0
        };
      } // Sort Probabilities


      prs.sort(function (a, b) {
        return a.pr - b.pr;
      }); // Cummulative Probabilities

      prs[0].cs = prs[0].pr;

      for (var _i3 = 1; _i3 < len; _i3++) {
        prs[_i3].cs = prs[_i3 - 1].cs + prs[_i3].pr;
      } // Randomize


      var rnd = Math.random(); // Gets only the items whose cumsum >= rnd

      var idx = 0;

      while (idx < len - 1 && prs[idx++].cs < rnd) {
        ;
      }

      ks.push(prs[idx - 1].v);
    }

    var ctr = 0;

    for (var _j = 0; _j < centroids.length; _j++) {
      if (centroids[_j].length == 0) {
        centroids[_j] = ks[original_centroid_count + ctr];
        ctr++;
      }
    }

    return centroids;
  }
};
//# sourceMappingURL=kinit.js.map

"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }

        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }

      return n[i].exports;
    }

    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
      o(t[i]);
    }

    return o;
  }

  return r;
})()({
  1: [function (require, module, exports) {
    "use strict";

    (function () {
      var root = this;
      var previous_skmeans = root.skmeans;

      var skmeans = require('./main.js');

      if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
          exports = module.exports = skmeans;
        }

        exports.skmeans = skmeans;
      }

      if (typeof window !== 'undefined') {
        window.skmeans = skmeans;
      }
    }).call(this);
  }, {
    "./main.js": 4
  }],
  2: [function (require, module, exports) {
    module.exports = {
      /**
       * Euclidean distance
       */
      eudist: function eudist(v1, v2) {
        var len = v1.length;
        var sum = 0;

        for (var i = 0; i < len; i++) {
          var d = (v1[i] || 0) - (v2[i] || 0);
          sum += d * d;
        } // Square root not really needed


        return sum;
      },
      mandist: function mandist(v1, v2) {
        var len = v1.length;
        var sum = 0,
            d = 0;

        for (var i = 0; i < len; i++) {
          d = (v1[i] || 0) - (v2[i] || 0);
          sum += d >= 0 ? d : -d;
        }

        return sum;
      },

      /**
       * Unidimensional distance
       */
      dist: function dist(v1, v2, sqrt) {
        var d = Math.abs(v1 - v2);
        return sqrt ? d : d * d;
      }
    };
  }, {}],
  3: [function (require, module, exports) {
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
  }, {
    "./distance.js": 2
  }],
  4: [function (require, module, exports) {
    /*jshint esversion: 6 */
    var Distance = require("./distance.js"),
        ClusterInit = require("./kinit.js"),
        eudist = Distance.eudist,
        mandist = Distance.mandist,
        absdist = Distance.dist,
        kmrand = ClusterInit.kmrand,
        kmpp = ClusterInit.kmpp;

    var MAX = 10000;
    /**
     * Inits an array with values
     */

    function fill(len, val, v) {
      v = v || [];

      for (var i = 0; i < len; i++) {
        v[i] = val;
      }

      return v;
    }

    function test(point, fndist) {
      var ks = this.centroids,
          k = ks.length; // For each value in data, find the nearest centroid

      var min = Infinity,
          idx = 0;

      for (var j = 0; j < k; j++) {
        // Custom, Multidimensional or unidimensional
        var dist = fndist ? fndist(point, ks[j]) : eudist(point, ks[j]);

        if (dist <= min) {
          min = dist;
          idx = j;
        }
      }

      return {
        idx: idx,
        centroid: ks[idx]
      };
    }

    function skmeans(data, k, maxit, fixedclusters) {
      // fixedclusters looks like [0, 1, 0, 0, -1, -1, -1], e.g.,
      // to indicate that 0, 2, 3 should stay clustered and
      // 1 should stay clustered and the last three data points
      // should go in some cluster, either one of the first two
      // or a new one
      if (!fixedclusters) {
        fixedclusters = data.map(function (x) {
          return -1;
        });
      }

      if (!fixedclusters.some(function (x) {
        return x === -1;
      })) {
        return {
          it: 0,
          k: k,
          idxs: fixedclusters,
          centroids: [],
          // skip the computation of centroids
          test: test
        };
      }

      if (data.length === 1) {
        return {
          it: 0,
          k: k,
          idxs: [0],
          centroids: [],
          test: test
        };
      }

      var ks = [],
          old = [],
          idxs = [],
          dist = [];
      var conv = false,
          it = maxit || MAX;
      var len = data.length,
          vlen = data[0].length;
      var count = [];

      for (var j = 0; j < k; j++) {
        ks[j] = [];
        count[j] = 0;
      } // fix centers based on pre-specified clusters


      if (fixedclusters) {
        // determine which clusters are fixed:
        var fixedcluster_inds = _toConsumableArray(new Set(fixedclusters)).sort().slice(1);

        var fixedclusters_set = new Set(fixedcluster_inds); // set up zero vectors to store means

        var sum = [];

        for (var _j2 = 0; _j2 < k; _j2++) {
          sum[_j2] = fill(vlen, 0, sum[_j2]);
        } // Sum, values, and count for each centroid


        for (var i = 0; i < len; i++) {
          if (fixedclusters[i] != -1) {
            var idx = fixedclusters[i],
                // Centroid for that item
            vsum = sum[idx],
                // Sum values for this centroid
            vect = data[i]; // Current vector
            // Accumulate value on the centroid for current vector

            for (var h = 0; h < vlen; h++) {
              vsum[h] += vect[h];
            }

            count[idx]++;
          }
        } // Calculate the average for each centroid


        for (var _j3 = 0; _j3 < k; _j3++) {
          if (fixedclusters_set.has(_j3)) {
            var ksj = ks[_j3],
                // Current centroid
            sumj = sum[_j3],
                // Accumulated centroid values
            cj = count[_j3]; // Number of elements for this centroid

            for (var _h = 0; _h < vlen; _h++) {
              ksj[_h] = sumj[_h] / cj || 0; // centroid
            }
          }
        }
      } else {
        var fixedclusters = fill(len, -1);
        var fixedcluster_inds = [];
        var fixedclusters_set = new Set();
      } // Choose initial points for the free clusters in a smart way


      kmpp(data, k, ks);

      do {
        // Reset count
        fill(k, 0, count); // For each non-fixed value in data, find the nearest centroid

        for (var _i4 = 0; _i4 < len; _i4++) {
          var min = Infinity,
              _idx = 0;

          if (fixedclusters[_i4] == -1) {
            // -1 indicates a non-fixed point
            for (var _j4 = 0; _j4 < k; _j4++) {
              var dist = eudist(data[_i4], ks[_j4]);

              if (dist <= min) {
                min = dist;
                _idx = _j4;
              }
            }
          } else {
            _idx = fixedclusters[_i4];
          }

          idxs[_i4] = _idx; // Index of the selected centroid for that value

          count[_idx]++; // Number of values for this centroid
        } // Recalculate centroids


        var sum = [],
            old = [];

        for (var _j5 = 0; _j5 < k; _j5++) {
          sum[_j5] = fill(vlen, 0, sum[_j5]);
          old[_j5] = ks[_j5];
        }

        for (var _j6 = 0; _j6 < k; _j6++) {
          if (!fixedclusters_set.has(_j6)) {
            ks[_j6] = [];
          }
        } // Sum values and count for each centroid


        for (var _i5 = 0; _i5 < len; _i5++) {
          var _idx2 = idxs[_i5],
              // Centroid for that item
          _vsum = sum[_idx2],
              // Sum values for this centroid
          _vect = data[_i5]; // Current vector
          // Accumulate value on the centroid for current vector

          for (var _h2 = 0; _h2 < vlen; _h2++) {
            _vsum[_h2] += _vect[_h2];
          }
        } // Calculate the average for each centroid


        conv = true;

        for (var _j7 = 0; _j7 < k; _j7++) {
          if (!fixedclusters_set.has(_j7)) {
            var _ksj = ks[_j7],
                // Current centroid
            _sumj = sum[_j7],
                // Accumulated centroid values
            oldj = old[_j7],
                // Old centroid value
            _cj = count[_j7]; // Number of elements for this centroid
            // New average

            for (var _h3 = 0; _h3 < vlen; _h3++) {
              _ksj[_h3] = _sumj[_h3] / _cj || 0; // New centroid
            } // Determine whether centroids have moved


            if (conv) {
              for (var _h4 = 0; _h4 < vlen; _h4++) {
                if (oldj[_h4] != _ksj[_h4]) {
                  conv = false;
                  break;
                }
              }
            }
          }
        }

        conv = conv || --it <= 0;
      } while (!conv);

      return {
        it: (maxit || MAX) - it,
        k: k,
        idxs: idxs,
        centroids: ks,
        test: test
      };
    }

    module.exports = skmeans;
  }, {
    "./distance.js": 2,
    "./kinit.js": 3
  }]
}, {}, [1]);
//# sourceMappingURL=skmeans.js.map

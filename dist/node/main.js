"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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

function init(len, val, v) {
  v = v || [];

  for (var i = 0; i < len; i++) {
    v[i] = val;
  }

  return v;
}

function test(point, fndist) {
  var multi = Array.isArray(point),
      ks = this.centroids,
      k = ks.length; // For each value in data, find the nearest centroid

  var min = Infinity,
      idx = 0;

  for (var j = 0; j < k; j++) {
    // Custom, Multidimensional or unidimensional
    var dist = fndist ? fndist(point, ks[j]) : multi ? eudist(point, ks[j]) : Math.abs(point - ks[j]);

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

function skmeans(data, k, initial, maxit, fndist, fixedclusters) {
  // fixedclusters looks like [0, 1, 0, 0, -1, -1, -1], e.g.,
  // to indicate that 0, 2, 3 should stay clustered and 
  // 1 should stay clustered and the last three data points
  // should go in some cluster, either one of the first two
  // or a new one
  var ks = [],
      old = [],
      idxs = [],
      dist = [];
  var conv = false,
      it = maxit || MAX;
  var len = data.length,
      vlen = data[0].length;
  var count = [];

  if (!initial) {
    var _idxs = {},
        z = 0;

    while (ks.length < k) {
      var idx = Math.floor(Math.random() * len);

      if (!_idxs[idx]) {
        _idxs[idx] = true;
        ks[z++] = data[idx];
      }
    }
  } else if (initial == "kmrand") {
    ks = kmrand(data, k);
  } else if (initial == "kmpp") {
    ks = kmpp(data, k, fndist);
  } else {
    ks = initial;
  } // fix centers based on pre-specified clusters


  if (fixedclusters) {
    // assign the fixed points to their clusters, permanently
    for (var i = 0; i < len; i++) {
      if (fixedclusters[i] != -1) {
        idxs[i] = fixedclusters[i];
      }
    } // which clusters are fixed:


    var fixedcluster_inds = _toConsumableArray(new Set(fixedclusters)).sort().slice(1);

    var fixedclusters_set = new Set(fixedcluster_inds); // set up zero vectors to store means

    var sum = [];

    for (var j = 0; j < k; j++) {
      sum[j] = init(vlen, 0, sum[j]);
    } // Sum values and count for each centroid


    for (var _i = 0; _i < len; _i++) {
      if (fixedclusters[_i] != -1) {
        var _idx = fixedclusters[_i],
            // Centroid for that item
        vsum = sum[_idx],
            // Sum values for this centroid
        vect = data[_i]; // Current vector
        // Accumulate value on the centroid for current vector

        for (var h = 0; h < vlen; h++) {
          vsum[h] += vect[h];
        }
      }
    } // Calculate the average for each centroid


    conv = true;

    for (var _j = 0; _j < k; _j++) {
      if (fixedclusters_set.has(_j)) {
        var ksj = ks[_j],
            // Current centroid
        sumj = sum[_j],
            // Accumulated centroid values
        oldj = old[_j],
            // Old centroid value
        cj = count[_j]; // Number of elements for this centroid

        for (var _h = 0; _h < vlen; _h++) {
          ksj[_h] = sumj[_h] / cj || 0; // centroid
        }
      }
    }
  } else {
    var fixedclusters = init(len, -1);
    var fixedcluster_inds = [];
    var fixedclusters_set = new Set();
  }

  do {
    // Reset k count
    init(k, 0, count); // For each non-fixed value in data, find the nearest centroid

    for (var _i2 = 0; _i2 < len; _i2++) {
      var min = Infinity,
          _idx2 = 0;

      if (fixedclusters[_i2] == -1) {
        // -1 indicates a non-fixed point
        for (var _j2 = 0; _j2 < k; _j2++) {
          var dist = fndist ? fndist(data[_i2], ks[_j2]) : eudist(data[_i2], ks[_j2]);

          if (dist <= min) {
            min = dist;
            _idx2 = _j2;
          }
        }
      } else {
        _idx2 = fixedclusters[_i2];
      }

      idxs[_i2] = _idx2; // Index of the selected centroid for that value

      count[_idx2]++; // Number of values for this centroid
    } // Recalculate centroids


    var sum = [],
        old = [],
        dif = 0;

    for (var _j3 = 0; _j3 < k; _j3++) {
      sum[_j3] = init(vlen, 0, sum[_j3]);
      old[_j3] = ks[_j3];
    }

    for (var _j4 = 0; _j4 < k; _j4++) {
      if (!fixedclusters_set.has(_j4)) {
        ks[_j4] = [];
      }
    } // Sum values and count for each centroid


    for (var _i3 = 0; _i3 < len; _i3++) {
      var _idx3 = idxs[_i3],
          // Centroid for that item
      _vsum = sum[_idx3],
          // Sum values for this centroid
      _vect = data[_i3]; // Current vector
      // Accumulate value on the centroid for current vector

      for (var _h2 = 0; _h2 < vlen; _h2++) {
        _vsum[_h2] += _vect[_h2];
      }
    } // Calculate the average for each centroid


    conv = true;

    for (var _j5 = 0; _j5 < k; _j5++) {
      var _ksj = ks[_j5],
          // Current centroid
      _sumj = sum[_j5],
          // Accumulated centroid values
      _oldj = old[_j5],
          // Old centroid value
      _cj = count[_j5]; // Number of elements for this centroid
      // New average

      for (var _h3 = 0; _h3 < vlen; _h3++) {
        _ksj[_h3] = _sumj[_h3] / _cj || 0; // New centroid
      } // Find if centroids have moved


      if (conv) {
        for (var _h4 = 0; _h4 < vlen; _h4++) {
          if (_oldj[_h4] != _ksj[_h4]) {
            conv = false;
            break;
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
//# sourceMappingURL=main.js.map

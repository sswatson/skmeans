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

    for (var _j = 0; _j < k; _j++) {
      sum[_j] = fill(vlen, 0, sum[_j]);
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


    for (var _j2 = 0; _j2 < k; _j2++) {
      if (fixedclusters_set.has(_j2)) {
        var ksj = ks[_j2],
            // Current centroid
        sumj = sum[_j2],
            // Accumulated centroid values
        cj = count[_j2]; // Number of elements for this centroid

        for (var _h = 0; _h < vlen; _h++) {
          ksj[_h] = sumj[_h] / cj || 0; // centroid
        }
      }
    }
  } else {
    var fixedclusters = fill(len, -1);
    var fixedcluster_inds = [];
    var fixedclusters_set = new Set();
  } // pick random points from the dataset as starting points 
  // for the free cluster centroids
  // let alreadypicked = {}, z = 0; 
  // let freeclusters = [...Array(k).keys()].filter(j=>!fixedclusters_set.has(j))
  // while(freeclusters.length > 0) {
  // 	let idx = Math.floor(Math.random()*len);
  // 	if (fixedclusters[idx] != -1) {
  // 		alreadypicked[idx] = true;
  // 	}
  // 	if(!alreadypicked[idx]) {
  // 		alreadypicked[idx] = true;
  // 		ks[freeclusters.shift()] = [...data[idx]];
  // 	}
  // }


  console.log(ks);
  kmpp(data, k, ks);
  console.log(ks);

  do {
    // Reset count
    fill(k, 0, count); // For each non-fixed value in data, find the nearest centroid

    for (var _i = 0; _i < len; _i++) {
      var min = Infinity,
          _idx = 0;

      if (fixedclusters[_i] == -1) {
        // -1 indicates a non-fixed point
        for (var _j3 = 0; _j3 < k; _j3++) {
          var dist = eudist(data[_i], ks[_j3]);

          if (dist <= min) {
            min = dist;
            _idx = _j3;
          }
        }
      } else {
        _idx = fixedclusters[_i];
      }

      idxs[_i] = _idx; // Index of the selected centroid for that value

      count[_idx]++; // Number of values for this centroid
    } // Recalculate centroids


    var sum = [],
        old = [];

    for (var _j4 = 0; _j4 < k; _j4++) {
      sum[_j4] = fill(vlen, 0, sum[_j4]);
      old[_j4] = ks[_j4];
    }

    for (var _j5 = 0; _j5 < k; _j5++) {
      if (!fixedclusters_set.has(_j5)) {
        ks[_j5] = [];
      }
    } // Sum values and count for each centroid


    for (var _i2 = 0; _i2 < len; _i2++) {
      var _idx2 = idxs[_i2],
          // Centroid for that item
      _vsum = sum[_idx2],
          // Sum values for this centroid
      _vect = data[_i2]; // Current vector
      // Accumulate value on the centroid for current vector

      for (var _h2 = 0; _h2 < vlen; _h2++) {
        _vsum[_h2] += _vect[_h2];
      }
    } // Calculate the average for each centroid


    conv = true;

    for (var _j6 = 0; _j6 < k; _j6++) {
      if (!fixedclusters_set.has(_j6)) {
        var _ksj = ks[_j6],
            // Current centroid
        _sumj = sum[_j6],
            // Accumulated centroid values
        oldj = old[_j6],
            // Old centroid value
        _cj = count[_j6]; // Number of elements for this centroid
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
//# sourceMappingURL=main.js.map

/*jshint esversion: 6 */

const
	Distance = require("./distance.js"),
	ClusterInit = require("./kinit.js"),
	eudist = Distance.eudist,
	mandist = Distance.mandist,
	absdist = Distance.dist,
	kmrand = ClusterInit.kmrand,
	kmpp = ClusterInit.kmpp;

const MAX = 10000;

/**
 * Inits an array with values
 */
function fill(len,val,v) {
	v = v || [];
	for(let i=0;i<len;i++) v[i] = val;
	return v;
}

function test(point, fndist) {
	let
		ks = this.centroids,
		k = ks.length;

	// For each value in data, find the nearest centroid
	let min = Infinity, idx = 0;
	for(let j=0;j<k;j++) {
		// Custom, Multidimensional or unidimensional
		let dist =	fndist? fndist(point,ks[j]) : eudist(point,ks[j])

		if(dist<=min) {
			min = dist;
			idx = j;
		}
	}

	return {
		idx, centroid:ks[idx]
	}
}

function skmeans(data,k,maxit,fixedclusters) {
	// fixedclusters looks like [0, 1, 0, 0, -1, -1, -1], e.g.,
	// to indicate that 0, 2, 3 should stay clustered and 
	// 1 should stay clustered and the last three data points
	// should go in some cluster, either one of the first two
	// or a new one
	var ks = [], old = [], idxs = [], dist = [];
	var conv = false, it = maxit || MAX;
	var len = data.length, vlen = data[0].length; 
	var count = [];
	
	for (let j=0;j<k;j++){
		ks[j] = [];
		count[j] = 0;
	}
	
	// fix centers based on pre-specified clusters
	if(fixedclusters) {
		
		// determine which clusters are fixed:
		var fixedcluster_inds = [...new Set(fixedclusters)].sort().slice(1);
		var fixedclusters_set = new Set(fixedcluster_inds);
		
		// set up zero vectors to store means
		var sum = []; 
		for(let j=0;j<k;j++) {
				sum[j] = fill(vlen,0,sum[j]);
		}

		// Sum, values, and count for each centroid
		for(let i=0;i<len;i++) {
			if (fixedclusters[i] != -1) {
				let	idx = fixedclusters[i],		// Centroid for that item
						vsum = sum[idx],	// Sum values for this centroid
						vect = data[i];		// Current vector

				// Accumulate value on the centroid for current vector
				for(let h=0;h<vlen;h++) {
					vsum[h] += vect[h];
				}
				count[idx]++;
			}
		}
		// Calculate the average for each centroid
		for(let j=0;j<k;j++) {
			if (fixedclusters_set.has(j)) {
				let ksj = ks[j],		// Current centroid
						sumj = sum[j],	// Accumulated centroid values
						cj = count[j];	// Number of elements for this centroid
				for(let h=0;h<vlen;h++) {
					ksj[h] = (sumj[h])/(cj) || 0;	// centroid
				}
			}
		}
	}
	else {
		var fixedclusters = fill(len, -1);
		var fixedcluster_inds = [];
		var fixedclusters_set = new Set();
	}
	
	// Choose initial points for the free clusters in a smart way
	kmpp(data, k, ks);

	do {
		// Reset count
		fill(k,0,count);

		// For each non-fixed value in data, find the nearest centroid
		for(let i=0;i<len;i++) {
			let min = Infinity, idx = 0;
			if (fixedclusters[i] == -1) { // -1 indicates a non-fixed point
				for(let j=0;j<k;j++) {
					var dist = eudist(data[i],ks[j]);
					
					if(dist<=min) {
						min = dist;
						idx = j;
					}
				}
			}
			else {
				idx = fixedclusters[i]; 
			}
			idxs[i] = idx;	// Index of the selected centroid for that value
			count[idx]++;		// Number of values for this centroid
		}		

		// Recalculate centroids
		var sum = [], old = [];
		for(let j=0;j<k;j++) {
				sum[j] = fill(vlen,0,sum[j]);
				old[j] = ks[j];
		}
		
		for(let j=0;j<k;j++) {
			if (!fixedclusters_set.has(j)) {
				ks[j] = [];
			}
		}

		// Sum values and count for each centroid
		for(let i=0;i<len;i++) {
			let	idx = idxs[i],		// Centroid for that item
					vsum = sum[idx],	// Sum values for this centroid
					vect = data[i];		// Current vector

			// Accumulate value on the centroid for current vector
			for(let h=0;h<vlen;h++) {
				vsum[h] += vect[h];
			}
		}
		
		// Calculate the average for each centroid
		conv = true;
		for(let j=0;j<k;j++) {
			if (!fixedclusters_set.has(j)) {
				let ksj = ks[j],		// Current centroid
						sumj = sum[j],	// Accumulated centroid values
						oldj = old[j], 	// Old centroid value
						cj = count[j];	// Number of elements for this centroid
				// New average
				for(let h=0;h<vlen;h++) {
					ksj[h] = (sumj[h])/(cj) || 0;	// New centroid
				}
				// Determine whether centroids have moved
				if(conv) {
					for(let h=0;h<vlen;h++) {
						if(oldj[h]!=ksj[h]) {
							conv = false;
							break;
						}
					}
				}
			}
		}
		conv = conv || (--it<=0);
	} while(!conv);

	return {
		it : (maxit || MAX) - it,
		k : k,
		idxs : idxs,
		centroids : ks,
		test : test
	};
}

module.exports = skmeans;

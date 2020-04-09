# skmeans

Fork of [this repo](https://github.com/solzimer/skmeans), modified to accommodate pre-specifying some of the clusters (and thus also their centroids) in advance. 

## Usage
### NodeJS
```javascript
var data = [[0, 0], [1, 0], [0, 1], [4, 4], [4, 5]];
// non-negatives for pre-set clusters; -1 for free points:
var clusters = [0, -1, -1, 1, 0]; 

var res = skmeans(data,2,null,10,null,clusters);
console.log(res);
```

## Results
```javascript
{ 
	it: 0,
  k: 2,
  idxs: [ 0, 1, 1, 1, 0 ],
  centroids: [ [ 0, 0 ], [ 1.3333333333333333, 1.6666666666666667 ] ],
  test: [Function: test] 
}
```

## API
### skmeans(data,k,[centroids],[iterations],[fixedclusters])

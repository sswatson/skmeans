# skmeans

Fork of [this repo](https://github.com/solzimer/skmeans), modified to accommodate pre-specifying some of the clusters (and thus also their centroids) in advance. 

## Usage
### NodeJS
```javascript
var data = [[0, 0], [1, 0], [0, 1], [4, 4], [4, 5]];
// non-negatives for pre-set clusters; -1 for free points:
var clusters = [0, 0, -1, 1, -1]; 

var res = skmeans(data,3,10,clusters);
console.log(res);
```

## Results
```javascript
{ 
  it: 0,
  k: 3,
  idxs: [ 0, 0, 2, 1, 1 ],
  centroids: [ [ 0.5, 0 ], [ 4, 4 ], [ 0, 1 ] ],
  test: [Function: test]
}
```

## API
### skmeans(data,k,max_iterations,fixedclusters)

const test = require('tape');
const disjointSet = require('../tmp/disjoint-set');

test('`DisjointSet` should create parents proportional to size', assert => {
  const msg = 'should be proportional';

  const actual = disjointSet.create(3).parents;
  const expected = [0, 1, 2];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`DisjointSet` should create ranks proportional to size', assert => {
  const msg = 'should be proportional';

  const actual = disjointSet.create(3).ranks;
  const expected = [0, 0, 0];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`DisjointSet.getRepr` should return the parent value at given index', assert => {
  const msg = 'should be proportional';

  const ds = disjointSet.create(3);
  const actual = ds.getRepr(1);
  const expected = 1;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`DisjointSet.mergeSets` should return false if `getRepr` returns same value', assert => {
  const msg = 'should return false for same value';
  const reprStub = () => 0;

  const ds = disjointSet.create(3);
  const originalRepr = ds.getRepr;
  ds.getRepr = reprStub;

  const actual = ds.mergeSets();
  const expected = false;

  assert.equal(actual, expected, msg);
  ds.getRepr = originalRepr;
  assert.end();
});

test('`DisjointSet.mergeSets` should increment rank with a zero rank index', assert => {
  const msg = 'should have incremented';
  const calls = [0, 1]; // will yield 0 - 0 from rank positions 0 & 1
  const reprStub = () => {
    return calls.shift();
  };

  const ds = disjointSet.create(2);
  const originalRepr = ds.getRepr;
  ds.getRepr = reprStub;

  ds.mergeSets();
  const actual = ds.ranks[0];
  const expected = 1;

  assert.equal(actual, expected, msg);
  ds.getRepr = originalRepr;
  assert.end();
});

test('`DisjointSet.mergeSets` should set correct parent w/ inverse rank index', assert => {
  const msg = 'should have updated correctly';
  const calls = [0, 1]; // will yield 1 - 0 from rank positions 0 & 1
  const ranks = [1, 1];
  const reprStub = () => {
    return calls.shift();
  };

  const ds = disjointSet.create(2);
  const originalRepr = ds.getRepr;
  ds.getRepr = reprStub;
  ds.ranks = ranks;

  ds.mergeSets();
  const actual = ds.parents[1];
  const expected = 0;

  assert.equal(actual, expected, msg);
  ds.getRepr = originalRepr;
  assert.end();
});

test('`DisjointSet.mergeSets` should set correct parent index w/ normal rank index', assert => {
  const msg = 'should have updated correctly';
  const calls = [0, 1]; // will yield 1 - 0 from rank positions 0 & 1
  const ranks = [0, 1];
  const reprStub = () => {
    return calls.shift();
  };

  const ds = disjointSet.create(2);
  const originalRepr = ds.getRepr;
  ds.getRepr = reprStub;
  ds.ranks = ranks;

  ds.mergeSets();
  const actual = ds.parents[0];
  const expected = 1;

  assert.equal(actual, expected, msg);
  ds.getRepr = originalRepr;
  assert.end();
});

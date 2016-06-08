const test = require('tape');
const disjointSet = require('../tmp/disjoint-set');

test('should exist', assert => {
  const msg = 'did not export a module';
  const actual = !!disjointSet;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should create parents proportional to size', assert => {
  const msg = 'should be proportional';

  const actual = disjointSet(3).parents;
  const expected = [0, 1, 2];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create ranks proportional to size', assert => {
  const msg = 'should be proportional';

  const actual = disjointSet(3).ranks;
  const expected = [0, 0, 0];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return the parent value at given index with `getRepr`', assert => {
  const msg = 'should be proportional';

  const ds = disjointSet(3);
  const actual = ds.getRepr(1);
  const expected = 1;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return false from `mergeSets` if `getRepr` returns same value', assert => {
  const msg = 'should return false for same value';
  const reprStub = () => 0;

  const ds = disjointSet(3);
  const originalRepr = ds.getRepr;
  ds.getRepr = reprStub;

  const actual = ds.mergeSets();
  const expected = false;

  assert.equal(actual, expected, msg);
  ds.getRepr = originalRepr;
  assert.end();
});

test('should increment rank via `mergeSets` with a zero rank index', assert => {
  const msg = 'should have incremented';
  const calls = [0, 1]; // will yield 0 - 0 from rank positions 0 & 1
  const reprStub = () => {
    return calls.shift();
  };

  const ds = disjointSet(2);
  const originalRepr = ds.getRepr;
  ds.getRepr = reprStub;

  ds.mergeSets();
  const actual = ds.ranks[0];
  const expected = 1;

  assert.equal(actual, expected, msg);
  ds.getRepr = originalRepr;
  assert.end();
});

test('should set correct parent with `mergeSets` via inverse rank index', assert => {
  const msg = 'should have updated correctly';
  const calls = [0, 1]; // will yield 1 - 0 from rank positions 0 & 1
  const ranks = [1, 1];
  const reprStub = () => {
    return calls.shift();
  };

  const ds = disjointSet(2);
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

test('should set correct parent index with `mergeSets` when normal rank index', assert => {
  const msg = 'should have updated parents correctly';
  const calls = [0, 1]; // will yield 1 - 0 from rank positions 0 & 1
  const ranks = [0, 1];
  const reprStub = () => {
    return calls.shift();
  };

  const ds = disjointSet(2);
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

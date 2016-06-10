const test = require('tape');
const isTargetSmaller = require('../../../tmp/update-edges/is-target-smaller');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!isTargetSmaller;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return a pure function', assert => {
  const msg = 'should not change';

  const arrOne = [1];
  const arrTwo = [1];
  const fn = isTargetSmaller(arrOne, arrTwo, 1);

  fn();

  const actual = arrOne.concat(arrTwo);
  const expected = [1, 1];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return an idempotent function', assert => {
  const msg = 'result is the same';
  const arrOne = [1];
  const arrTwo = [1];

  const actual = isTargetSmaller(arrOne, arrTwo);
  const expected = isTargetSmaller(arrOne, arrTwo);

  arrTwo.push(1);

  assert.equal(actual(), expected(), msg);
  assert.end();
});

test('should return false when target is greater than goal length', assert => {
  const msg = 'should be false';

  const fn = isTargetSmaller([1, 1], [1]);
  const actual = fn();
  const expected = false;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return false when target length is equal', assert => {
  const msg = 'should be false';

  const fn = isTargetSmaller([1], [1]);
  const actual = fn();
  const expected = false;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return true when added length param offsets target length', assert => {
  const msg = 'should be true';

  const fn = isTargetSmaller([1], [], 3);
  const actual = fn();
  const expected = true;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return true when target length is 2 less', assert => {
  const msg = 'should be true';

  const fn = isTargetSmaller([1], [1, 1, 1]);
  const actual = fn();
  const expected = true;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

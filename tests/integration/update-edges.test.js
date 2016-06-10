const test = require('tape');
const { isArray } = require('util');
const { createNodes, createEdges } = require('../helpers/create');
const updateEdges = require('../../tmp/update-edges/index');

// mock that returns opacity given
const getOpacity = (i, e) => e.opacity;

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!updateEdges;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'should not change';

  const actual = [createNodes(), createEdges(), 20, 0.5];
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  updateEdges(...actual, getOpacity);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'updated edges should be the same';

  const args = [createNodes(2), createEdges(), 20, 0.5];
  const actual = updateEdges(...args, getOpacity);
  const expected = updateEdges(...args, getOpacity);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return an array of new edge objects', assert => {
  const msg = 'return new edge object';

  const expected = createEdges();
  const actual = updateEdges(createNodes(2), expected, 20, 0.5, getOpacity);

  assert.ok(isArray(actual), 'did not return array');
  assert.notEqual(actual[0], expected[0], msg);
  assert.end();
});

test('should return more edges when more nodes present', assert => {
  const msg = '`moreEdges` is greater than `lessEdges`';

  const { length: lessEdges } = updateEdges(createNodes(2), [], 20, 0.5, getOpacity);
  const { length: moreEdges } = updateEdges(createNodes(4), [], 20, 0.5, getOpacity);

  assert.ok(lessEdges < moreEdges, msg);
  assert.end();
});

test('should return more edges when `maxExtraEdges` is higher', assert => {
  const msg = '`moreEdges` is greater than `lessEdges`';

  const { length: lessEdges } = updateEdges(createNodes(100), [], 0, 0.5, getOpacity); // 0 = maxExtraEdges
  const { length: moreEdges } = updateEdges(createNodes(100), [], 100, 0.5, getOpacity); // 100 = maxExtraEdges

  assert.ok(lessEdges < moreEdges, msg);
  assert.end();
});

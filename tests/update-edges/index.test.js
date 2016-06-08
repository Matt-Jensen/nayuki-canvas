const test = require('tape');
const { isArray } = require('util');
const { createNodes, createEdges } = require('../helpers/create');
const updateEdges = require('../../tmp/update-edges/index');

const settings = {
  nodes: [],
  edges: [],
  maxExtraEdges: 20,
  radiiWeightPower: 0.5,
  FADE_IN_RATE: 0.05,
  FADE_OUT_RATE: 0.05
};

const createInstance = (conf = {}) =>
  Object.assign(Object.create({ updateEdges }), settings, conf);

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!updateEdges;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'should not change';

  const actual = createInstance({ nodes: createNodes(), edges: createEdges() });
  const expected = createInstance({ nodes: createNodes(), edges: createEdges() });

  actual.updateEdges();

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return an array of new edge objects', assert => {
  const msg = 'return new edge object';

  const expected = createEdges();
  const instance = createInstance({ nodes: createNodes(2), edges: expected });
  const actual = instance.updateEdges();

  assert.ok(isArray(actual), 'did not return array');
  assert.notEqual(actual[0], instance.edges[0], msg);
  assert.end();
});

test('should return more edges when more nodes present', assert => {
  const msg = '`moreEdges` is greater than `lessEdges`';

  const { length: lessEdges } = createInstance({ nodes: createNodes(2) }).updateEdges();
  const { length: moreEdges } = createInstance({ nodes: createNodes(4) }).updateEdges();

  assert.ok(lessEdges < moreEdges, msg);
  assert.end();
});

test('should return more edges when `maxExtraEdges` is higher', assert => {
  const msg = '`moreEdges` is greater than `lessEdges`';

  const { length: lessEdges } = createInstance({ nodes: createNodes(100), maxExtraEdges: 0 }).updateEdges();
  const { length: moreEdges } = createInstance({ nodes: createNodes(100), maxExtraEdges: 100 }).updateEdges();

  assert.ok(lessEdges < moreEdges, msg);
  assert.end();
});

const test = require('tape');
const nodePair = require('../../tmp/get-node-deltas/node-pair');
const { createNodes } = require('../helpers/create');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!nodePair;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be and provide pure functions', assert => {
  const msg = '`nodes` were updated';
  const actual = createNodes(2);
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  const np = nodePair(...actual);

  // invoke all enumerables
  Object.keys(np).forEach(k => np[k]);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'node pairs are the same';

  const nodes = [].concat(createNodes(1), createNodes(1, { posX: 2, posY: 2}));
  const actual = nodePair(...nodes, 0.0001);
  const expected = nodePair(...nodes, 0.0001);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should provide idempotent methods', assert => {
  const msg = 'node pairs methods produce same';

  const nodes = [].concat(createNodes(1), createNodes(1, { posX: 2, posY: 2}));
  const actual = nodePair(...nodes, 0.0001);
  const expected = nodePair(...nodes, 0.0001);

  assert.equal(actual.nodeA, expected.nodeA, msg);
  assert.equal(actual.nodeB, expected.nodeB, msg);
  assert.equal(actual.x, expected.y, msg);
  assert.equal(actual.y, expected.y, msg);
  assert.equal(actual.repulsionForce, expected.repulsionForce, msg);
  assert.equal(actual.distSqr, expected.distSqr, msg);
  assert.equal(actual.factory, expected.factory, msg);
  assert.deepEqual(actual.deltas, expected.deltas, msg);

  assert.end();
});

test('should have a `x` that is the difference between given nodes', assert => {
  const msg = 'should be a difference of `1`';

  const nodeA = { posX: 2 };
  const nodeB = { posX: 1 };
  const { x: actual } = nodePair(nodeA, nodeB, 1);
  const expected = 1;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should have a `y` that is the difference between given nodes', assert => {
  const msg = 'should be a difference of `2`';

  const nodeA = { posY: 3 };
  const nodeB = { posY: 1 };
  const { y: actual } = nodePair(nodeA, nodeB, 1);
  const expected = 2;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should have a x delta that is the product of `x` and `factor`', assert => {
  const msg = 'should be a difference of `2`';

  const nodeA = { posX: 1, posY: 1 };
  const nodeB = { posX: 2, posY: 2 };
  const pair = nodePair(nodeA, nodeB, 1);
  const { dx: actual } = pair.deltas;
  const expected = pair.x * pair.factor;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should have a y delta that is the product of `y` and `factor`', assert => {
  const msg = 'should be a difference of `2`';

  const nodeA = { posX: 1, posY: 1 };
  const nodeB = { posX: 2, posY: 2 };
  const pair = nodePair(nodeA, nodeB, 1);
  const { dy: actual } = pair.deltas;
  const expected = pair.y * pair.factor;

  assert.equal(actual, expected, msg);
  assert.end();
});

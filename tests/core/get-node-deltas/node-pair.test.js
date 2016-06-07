const test = require('tape');
const nodePair = require('../../../tmp/core/get-node-deltas/node-pair');

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

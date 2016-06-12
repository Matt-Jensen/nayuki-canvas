const test = require('tape');
const calcAllEdgeWeights = require('../../../tmp/utils/calc-all-edge-weights');
const { createNodes } = require('../../helpers/create');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!calcAllEdgeWeights;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'did not updated arguments';
  const actual = {
    nodes: createNodes(2),
    radiiWeightPower: 1
  };
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  calcAllEdgeWeights(actual.nodes, actual.radiiWeightPower);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'results should be the same';

  const actual = calcAllEdgeWeights([], 1);
  const expected = calcAllEdgeWeights([], 1);

  assert.same(actual, expected, msg);
  assert.end();
});

test('should return new array', assert => {
  const msg = 'should be new array';

  const nodes = [];
  const result = calcAllEdgeWeights(nodes, 1);
  const actual = result !== nodes;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return array of weighted edges', assert => {
  const msg = 'should be weighted edges array';

  const nodes = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];
  const actual = calcAllEdgeWeights(nodes, 1);
  const expected = [[0.7071067811865476, 1, 0]];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should not update inputs', assert => {
  const msg = 'should be not update `nodes`';

  const nodes = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];
  calcAllEdgeWeights(nodes, 1);

  const actual = nodes;
  const expected = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should sort edges weight', assert => {
  const msg = 'should be a sorted edges array';

  const edge1 = { posX: 1, posY: 1, radius: 1 };
  const edge2 = { posX: 2, posY: 2, radius: 2 };
  const edge3 = { posX: 3, posY: 3, radius: 3 };
  const nodes = [edge1, edge2, edge3];
  const result = calcAllEdgeWeights(nodes, 1);
  const weights = result.map(e => e[0]);
  const actual = weights[0] < weights[1] && weights[1] < weights[2];
  const expected = true;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

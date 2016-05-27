const test = require('tape');
const utils = require('../tmp/utils');
const { containsEdge, calcSpanningTree, calcAllEdgeWeights } = utils;

test('`containsEdge` should return false if edge not found', assert => {
  const msg = 'should return `false` for not found';

  const actual = containsEdge([], {});
  const expected = false;

  assert.same(actual, expected, msg);
  assert.end();
});

test('`containsEdge` should return true if edge found', assert => {
  const msg = 'should return `true` for found';

  const edge = { nodeA: {}, nodeB: {} };
  const actual = containsEdge([edge], edge);
  const expected = true;

  assert.same(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should return new array', assert => {
  const msg = 'should be new array';

  const edges = [];
  const nodes = [];
  const result = calcSpanningTree(edges, nodes);
  const actual = result !== edges && result !== nodes;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should return an array of new edge objects', assert => {
  const msg = 'should create new array of edges';

  const actual = calcSpanningTree([ ['', 0, 1] ], [{ x: 1 }, { y: 2 }]);
  const expected = [{
    nodeA: { x: 1 },
    nodeB: { y: 2 }
  }];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should not change inputs', assert => {
  const msg = 'should not change inputs';

  const actualEdges = [['', 0, 1]];
  const actualNodes = [{ x: 1 }, { y: 2 }];

  calcSpanningTree(actualEdges, actualNodes);

  const expectedEdges = [['', 0, 1]];
  const expectedNodes = [{ x: 1 }, { y: 2 }];

  assert.deepEqual(actualEdges, expectedEdges, msg);
  assert.deepEqual(actualNodes, expectedNodes, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should return new array', assert => {
  const msg = 'should be new array';

  const nodes = [];
  const result = calcAllEdgeWeights(nodes, 1);
  const actual = result !== nodes;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should return array of weighted edges', assert => {
  const msg = 'should be weighted edges array';

  const nodes = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];
  const actual = calcAllEdgeWeights(nodes, 1);
  const expected = [[0.7071067811865476, 1, 0]];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should not update inputs', assert => {
  const msg = 'should be not update `nodes`';

  const nodes = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];
  calcAllEdgeWeights(nodes, 1);

  const actual = nodes;
  const expected = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should sort edges weight', assert => {
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

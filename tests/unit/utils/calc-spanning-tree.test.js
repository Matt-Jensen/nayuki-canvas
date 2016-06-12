const test = require('tape');
const calcSpanningTree = require('../../../tmp/utils/calc-spanning-tree');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!calcSpanningTree;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'results should be the same';

  const edges = [['', 0, 1]];
  const nodes = [{ x: 1 }, { y: 2 }];
  const actual = calcSpanningTree(edges, nodes);
  const expected = calcSpanningTree(edges, nodes);

  assert.same(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'did not updated arguments';
  const actual = {
    edges: [['', 0, 1]],
    nodes: [{ x: 1 }, { y: 2 }]
  };
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  calcSpanningTree(actual.edges, actual.nodes);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return new array', assert => {
  const msg = 'should be new array';

  const edges = [];
  const nodes = [];
  const result = calcSpanningTree(edges, nodes);
  const actual = result !== edges && result !== nodes;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return an array of new edge objects', assert => {
  const msg = 'should create new array of edges';

  const actual = calcSpanningTree([ ['', 0, 1] ], [{ x: 1 }, { y: 2 }]);
  const expected = [{
    nodeA: { x: 1 },
    nodeB: { y: 2 }
  }];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should not change inputs', assert => {
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

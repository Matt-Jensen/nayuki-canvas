const { test } = require('tap');
const containsEdge = require('../../../tmp/utils/contains-edge');
const { createNodes, createEdges } = require('../../helpers/create');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!containsEdge;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'did not updated arguments';
  const nodes = createNodes(2);
  const actual = {
    edge: createEdges(1, { nodeA: nodes[0], nodeB: nodes[1] }),
  };
  actual.allEdges = [].concat(createEdges(1), [actual.edge]);
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  containsEdge(actual.allEdges, actual.edge);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'results should be the same';

  const actual = containsEdge([], {});
  const expected = containsEdge([], {});

  assert.same(actual, expected, msg);
  assert.end();
});

test('should return false if edge not found', assert => {
  const msg = 'should return `false` for not found';

  const actual = containsEdge([], {});
  const expected = false;

  assert.same(actual, expected, msg);
  assert.end();
});

test('should return true if edge found', assert => {
  const msg = 'should return `true` for found';

  const edge = { nodeA: {}, nodeB: {} };
  const actual = containsEdge([edge], edge);
  const expected = true;

  assert.same(actual, expected, msg);
  assert.end();
});

const test = require('tape');
const { isObject, isUndefined } = require('util');
const { createNodes, createEdges } = require('../helpers/create');
const canvasFrame = require('../../tmp/redraw-canvas/canvas-frame');

const canvasElem = { width: 100, height: 100 };

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!canvasFrame;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'canvas frames are the same';

  const config = { nodes: createNodes(2), edges: createEdges(2), canvasElem };
  const actual = canvasFrame(config);
  const expected = canvasFrame(config);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should have idempotent methods', assert => {
  const msg = 'canvas frames methods produce same result';

  const config = { nodes: createNodes(2), edges: createEdges(2), canvasElem };
  const actual = canvasFrame(config);
  const expected = canvasFrame(config);

  assert.deepEqual(actual.nodes, expected.nodes, msg);
  assert.deepEqual(actual.edges, expected.edges, msg);
  assert.end();
});

test('should provide only pure functions', assert => {
  const msg = '`nodes` were updated';
  const actual = { nodes: createNodes(2), edges: createEdges(2), canvasElem };
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  const cf = canvasFrame(actual);

  // invoke all enumerables
  Object.keys(cf).forEach(k => cf[k]);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should `create()` new Canvas Frame instances', assert => {
  const msg = 'should be an object';

  const actual = isObject(canvasFrame({ canvasElem }));
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should provide a pure function: `create()`', assert => {
  const msg = 'should not change';

  const actual = { canvasElem };
  const expected = { canvasElem };

  canvasFrame({ canvasElem });

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance with properties: `width`, `height`, and `size`', assert => {
  const msg = 'should be defined';
  const actual = canvasFrame({ canvasElem });
  const expected = false;

  assert.equal(isUndefined(actual.data.width), expected, msg);
  assert.equal(isUndefined(actual.data.height), expected, msg);
  assert.equal(isUndefined(actual.data.size), expected, msg);

  assert.end();
});

test('should create instance that resolves `nodes` array without updating config.nodes', assert => {
  const msg = 'should not have changed';

  const actual = createNodes(2);
  const expected = JSON.parse(JSON.stringify(actual)); // clone
  const instance = canvasFrame({ canvasElem, nodes: actual });

  instance.nodes; // eslint-disable-line

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `nodes` proportional to config.nodes', assert => {
  const msg = 'should have a length of `2`';

  const nodes = createNodes(2);
  console.log(Object.keys(canvasFrame({ canvasElem, nodes })));
  const actual = canvasFrame({ canvasElem, nodes }).nodes.length;
  const expected = nodes.length;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `nodes` with arcs that are multiples of instance `size`', assert => {
  const msg = 'should be a multiple';

  const instance = canvasFrame({ canvasElem, nodes: createNodes(1) });
  const size = instance.data.size;
  const node = instance.nodes[0];

  const actual = (node.arc[0] % size + node.arc[1] % size + node.arc[2] % size) === 0;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `edges` array without updating config.edges', assert => {
  const msg = 'should not have changed';

  const actual = createEdges(2);
  const expected = createEdges(2);
  const instance = canvasFrame({ canvasElem, edges: actual });

  instance.edges; // eslint-disable-line

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `edges` array of only visible edges', assert => {
  const msg = 'should resolve only one edge';

  const edges = createEdges(2);
  edges[0].doNotInclude = true;
  const instance = canvasFrame({ canvasElem, edges });

  // Stub `isEdgeVisible` to remove first
  instance.isEdgeVisible = e => isUndefined(e.doNotInclude);

  const actual = instance.edges.length;
  const expected = 1;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `edges` array item properties: `style`, `start`, `end`', assert => {
  const msg = 'should resolve only one edge';

  const instance = canvasFrame({ canvasElem, edges: createEdges(1) });

  // Stub `isEdgeVisible` to include all
  instance.isEdgeVisible = () => true;

  const actual = instance.edges[0];
  const expected = false;

  assert.equal(isUndefined(actual.style), expected, msg);
  assert.equal(isUndefined(actual.start), expected, msg);
  assert.equal(isUndefined(actual.end), expected, msg);
  assert.end();
});

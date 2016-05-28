const test = require('tape');
const { isObject, isUndefined } = require('util');
const { createNodes, createEdges } = require('../../helpers/create');
const canvasFrame = require('../../../tmp/core/redraw-canvas/canvas-frame');

const canvasElem = { width: 100, height: 100 };

test('should `create()` new Canvas Frame instances', assert => {
  const msg = 'should be an object';

  const actual = isObject(canvasFrame.create({ canvasElem }));
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should provide a pure function: `create()`', assert => {
  const msg = 'should not change';

  const actual = { canvasElem };
  const expected = { canvasElem };

  canvasFrame.create({ canvasElem });

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance with properties: `width`, `height`, and `size`', assert => {
  const msg = 'should be defined';
  const actual = canvasFrame.create({ canvasElem });
  const expected = false;

  assert.equal(isUndefined(actual.data.width), expected, msg);
  assert.equal(isUndefined(actual.data.height), expected, msg);
  assert.equal(isUndefined(actual.data.size), expected, msg);

  assert.end();
});

test('should create instance that instantiates a Frame Background with `data`', assert => {
  const msg = 'should have been created with data';
  const expected = 'test';
  const frameBackground = {
    create (actual) {
      assert.equal(actual, expected, msg);
      assert.end();

      // mock frameBackground instance
      return { radialGradient () {} };
    }
  };

  const instance = canvasFrame.create({ canvasElem });

  // Overwrite instance properties
  Object.assign(instance, { frameBackground, data: expected });
  instance.background; // eslint-disable-line
});

test('should create instance that resolves `nodes` array without updating config.nodes', assert => {
  const msg = 'should not have changed';

  const actual = createNodes(2);
  const expected = createNodes(2);
  const instance = canvasFrame.create({ canvasElem, nodes: actual });

  instance.nodes; // eslint-disable-line

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `nodes` proportional to config.nodes', assert => {
  const msg = 'should have a length of `2`';

  const nodes = createNodes(2);
  const actual = canvasFrame.create({ canvasElem, nodes }).nodes.length;
  const expected = nodes.length;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `nodes` with arcs that are multiples of instance `size`', assert => {
  const msg = 'should be a multiple';

  const instance = canvasFrame.create({ canvasElem, nodes: createNodes(1) });
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
  const instance = canvasFrame.create({ canvasElem, edges: actual });

  instance.edges; // eslint-disable-line

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `edges` array of only visible edges', assert => {
  const msg = 'should resolve only one edge';

  const edges = createEdges(2);
  edges[0].doNotInclude = true;
  const instance = canvasFrame.create({ canvasElem, edges });

  // Stub `isEdgeVisible` to remove first
  instance.isEdgeVisible = e => isUndefined(e.doNotInclude);

  const actual = instance.edges.length;
  const expected = 1;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should create instance that resolves `edges` array item properties: `style`, `start`, `end`', assert => {
  const msg = 'should resolve only one edge';

  const instance = canvasFrame.create({ canvasElem, edges: createEdges(1) });

  // Stub `isEdgeVisible` to include all
  instance.isEdgeVisible = () => true;

  const actual = instance.edges[0];
  const expected = false;

  assert.equal(isUndefined(actual.style), expected, msg);
  assert.equal(isUndefined(actual.start), expected, msg);
  assert.equal(isUndefined(actual.end), expected, msg);
  assert.end();
});

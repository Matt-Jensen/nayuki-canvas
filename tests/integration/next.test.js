const test = require('tape');
const next = require('../../tmp/next');
const { createNodes, createEdges } = require('../helpers/create');

const settings = {
  idealNumNodes: 2,
  BORDER_FADE: -0.02,
  relWidth: 100,
  relHeight: 100,
  nodes: [],
  edges: []
};

const prototype = {
  _getOpacity: (fade, o) => o.opacity,
  _updateNodes () {
    return this.nodes;
  },
  updateEdges () {
    return this.edges;
  },
  getNodeDeltas () {
    return this.nodes.map(() => 0);
  },
  redrawCanvas: () => {}
};

const createInstance = (conf = {}) =>
  Object.assign(Object.create(prototype), settings, conf);

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!next;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should support chaning', assert => {
  const msg = 'returns this';
  const expected = createInstance();
  const actual = next.call(expected);
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should not change `idealNumNodes`', assert => {
  const msg = '`idealNumNodes` has not changed';
  const actual = 100;
  const expected = 100;

  next.call(createInstance(), actual);

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should update instance `nodes`', assert => {
  const msg = 'instance `nodes` were updated';
  const actual = createInstance({ nodes: createNodes(2) });
  const expected = JSON.parse(JSON.stringify(actual.nodes)); // clone
  const originalUpdateNodes = prototype.updateNodes;

  // stub to perform some update to nodes
  prototype.updateNodes = function () {
    return this.nodes.map(n => Object.assign({}, n, { posX: 2 }));
  };

  next.call(actual);

  assert.notDeepEqual(actual.nodes, expected, msg);

  prototype.updateNodes = originalUpdateNodes;
  assert.end();
});

test('should update instance `edges`', assert => {
  const msg = 'instance `edges` were updated';
  const actual = createInstance({ nodes: createNodes(2) });
  const expected = JSON.parse(JSON.stringify(actual.edges)); // clone
  const originalUpdateEdges = prototype.updateEdges;

  // stub to perform some update to nodes
  prototype.updateEdges = function () {
    return this.nodes.map(() => createEdges(1)[0]);
  };

  next.call(actual);

  assert.notDeepEqual(actual.edges, expected, msg);

  prototype.updateEdges = originalUpdateEdges;
  assert.end();
});

test('should invoke `redrawCanvas`', assert => {
  const msg = '`redrawCanvas` was called';
  const instance = createInstance();
  const originalRedrawCanvas = prototype.redrawCanvas;

  prototype.redrawCanvas = function () {
    assert.ok(true, msg);
    prototype.redrawCanvas = originalRedrawCanvas;
    assert.end();
  };

  next.call(instance);
});

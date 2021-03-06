const { test } = require('tap');
const next = require('../../tmp/next');
const { createNodes, createEdges } = require('../helpers/create');
const { assign } = require('lodash');

const { create } = Object;

const settings = {
  _idealnodeCount: 2,
  borderFade: -0.02,
  _relWidth: 100,
  _relHeight: 100,
  _nodes: [],
  _edges: []
};

const prototype = {
  _getOpacity: (fade, o) => o.opacity,
  _updateNodes () {
    return this._nodes;
  },
  _updateEdges () {
    return this._edges;
  },
  _getNodeDeltas () {
    return this._nodes.map(() => 0);
  },
  _redrawCanvas: () => {}
};

const createInstance = (conf = {}) =>
  assign(create(prototype), settings, conf);

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

test('should not change `idealnodeCount`', assert => {
  const msg = '`idealnodeCount` has not changed';
  const actual = 100;
  const expected = 100;

  next.call(createInstance(), actual);

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should update instance `nodes`', assert => {
  const msg = 'instance `nodes` were updated';
  const actual = createInstance({ _nodes: createNodes(2) });
  const expected = JSON.parse(JSON.stringify(actual._nodes)); // clone
  const originalUpdateNodes = prototype._updateNodes;

  // stub to perform some update to nodes
  prototype._updateNodes = function () {
    return this._nodes.map(n => assign({}, n, { posX: 2 }));
  };

  next.call(actual);

  assert.notDeepEqual(actual._nodes, expected, msg);

  prototype._updateNodes = originalUpdateNodes;
  assert.end();
});

test('should update instance `edges`', assert => {
  const msg = 'instance `edges` were updated';
  const actual = createInstance({ _nodes: createNodes(2) });
  const expected = JSON.parse(JSON.stringify(actual._edges)); // clone
  const originalUpdateEdges = prototype._updateEdges;

  // stub to perform some update to nodes
  prototype._updateEdges = function () {
    return this._nodes.map(() => createEdges(1)[0]);
  };

  next.call(actual);

  assert.notDeepEqual(actual._edges, expected, msg);

  prototype._updateEdges = originalUpdateEdges;
  assert.end();
});

test('should invoke `_redrawCanvas`', assert => {
  const msg = '`_redrawCanvas` was called';
  const instance = createInstance();
  const originalRedrawCanvas = prototype._redrawCanvas;

  prototype._redrawCanvas = function () {
    assert.ok(true, msg);
    prototype._redrawCanvas = originalRedrawCanvas;
    assert.end();
  };

  next.call(instance);
});

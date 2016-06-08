const test = require('tape');
const next = require('../tmp/next');

const settings = {
  idealNumNodes: 2,
  BORDER_FADE: -0.02,
  relWidth: 100,
  relHeight: 100,
  nodes: [],
  edges: []
};

const prototype = {
  _getOpacity: o => o,
  updateNodes: () => [],
  updateEdges: () => [],
  getNodeDeltas: () => [],
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

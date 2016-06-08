const test = require('tape');
const getEdgeOpacity = require('../../tmp/update-edges/get-edge-opacity');
const { createEdges } = require('../helpers/create');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!getEdgeOpacity;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'should not change';

  const isFadingIn = true;
  const edge = { opacity: 0.5 };
  const FADE_IN_RATE = 0.05;
  const FADE_OUT_RATE = 0.05;

  getEdgeOpacity(isFadingIn, edge, FADE_IN_RATE, FADE_OUT_RATE);

  assert.equal(isFadingIn, true, msg);
  assert.deepEqual(edge, { opacity: 0.5 }, msg);
  assert.equal(FADE_IN_RATE, 0.05, msg);
  assert.equal(FADE_OUT_RATE, 0.05, msg);
  assert.end();
});

test('should increase opacity when fading in', assert => {
  const msg = 'increases edge opacity';

  const actual = getEdgeOpacity(true, { opacity: 0.5 }, 0.05, 0.05);
  const expected = 0.55;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should decrease opacity when fading out', assert => {
  const msg = 'decreases edge opacity';

  const actual = getEdgeOpacity(false, { opacity: 0.5 }, 0.05, 0.05);
  const expected = 0.45;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should fade in faster when `FADE_IN_RATE` is higher', assert => {
  const msg = 'has higher rate of opacity increase';

  const slower = getEdgeOpacity(true, createEdges()[0], 0.05, 0.05);
  const faster = getEdgeOpacity(true, createEdges()[0], 0.1, 0.05);

  assert.ok(slower < faster, msg);
  assert.end();
});

test('should fade out faster when `FADE_OUT_RATE` is higher', assert => {
  const msg = 'has higher rate of opacity increase';

  const faster = getEdgeOpacity(false, createEdges()[0], 0.05, 0.1);
  const slower = getEdgeOpacity(false, createEdges()[0], 0.05, 0.05);

  assert.ok(faster < slower, msg);
  assert.end();
});

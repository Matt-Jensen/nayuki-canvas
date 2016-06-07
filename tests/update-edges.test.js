const test = require('tape');
const { createNodes, createEdges } = require('./helpers/create');
const updateEdges = require('../tmp/update-edges').default;
const getEdgeOpacity = require('../tmp/update-edges').getEdgeOpacity;
const isEdgeActive = require('../tmp/update-edges').isEdgeActive;
const isTargetSmaller = require('../tmp/update-edges').isTargetSmaller;

const config = {
  FADE_IN_RATE: 0.05,
  FADE_OUT_RATE: 0.05
};
const settings = {
  nodes: [],
  edges: [],
  maxExtraEdges: 20,
  radiiWeightPower: 0.5
};
const createInstance = (conf = {}) => Object.assign({}, settings, { config }, conf, { updateEdges });

test('`getEdgeOpacity` should be a pure function', assert => {
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

test('`getEdgeOpacity` should increase opacity when fading in', assert => {
  const msg = 'should increase';

  const actual = getEdgeOpacity(true, { opacity: 0.5 }, 0.05, 0.05);
  const expected = 0.55;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`getEdgeOpacity` should decrease opacity when fading out', assert => {
  const msg = 'should decrease';

  const actual = getEdgeOpacity(false, { opacity: 0.5 }, 0.05, 0.05);
  const expected = 0.45;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`isEdgeActive` should be a pure function', assert => {
  const msg = 'should not change';

  const actual = { opacity: 0.5, nodeA: { opacity: 0.5 }, nodeB: { opacity: 0.5 } };
  const expected = Object.assign({}, actual);

  isEdgeActive(actual);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`isEdgeActive` should return false if any edge opacities are not positive', assert => {
  const msg = 'should be false';

  const expected = false;

  const [edgeOne] = createEdges(1, { opacity: 0 });
  assert.equal(isEdgeActive(edgeOne), expected, msg);

  const [edgeTwo] = createEdges(1, { nodeA: { opacity: 0 } });
  assert.equal(isEdgeActive(edgeTwo), expected, msg);

  const [edgeThree] = createEdges(1, { nodeB: { opacity: 0 } });
  assert.equal(isEdgeActive(edgeThree), expected, msg);

  assert.end();
});

test('`isEdgeActive` should return true if all edge opacities are positive', assert => {
  const msg = 'should be true';

  const edge = { opacity: 0.5, nodeA: { opacity: 0.5 }, nodeB: { opacity: 0.5 } };
  const actual = isEdgeActive(edge);
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`isTargetSmaller` should return a pure function', assert => {
  const msg = 'should not change';

  const arrOne = [1];
  const arrTwo = [1];
  const fn = isTargetSmaller(arrOne, arrTwo, 1);

  fn();

  const actual = arrOne.concat(arrTwo);
  const expected = [1, 1];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`isTargetSmaller` should return false when target is greater than goal length', assert => {
  const msg = 'should be false';

  const fn = isTargetSmaller([1, 1], [1]);
  const actual = fn();
  const expected = false;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`isTargetSmaller` should return false when target length is equal', assert => {
  const msg = 'should be false';

  const fn = isTargetSmaller([1], [1]);
  const actual = fn();
  const expected = false;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`isTargetSmaller` should return true when added length param offsets target length', assert => {
  const msg = 'should be true';

  const fn = isTargetSmaller([1], [], 3);
  const actual = fn();
  const expected = true;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`isTargetSmaller` should return true when target length is 2 less', assert => {
  const msg = 'should be true';

  const fn = isTargetSmaller([1], [1, 1, 1]);
  const actual = fn();
  const expected = true;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`updateEdges` should be a pure function', assert => {
  const msg = 'should not change';

  const actual = createInstance({ nodes: createNodes(), edges: createEdges() });
  const expected = createInstance({ nodes: createNodes(), edges: createEdges() });

  actual.updateEdges();

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`updateEdges` should return an array of updated edges', assert => {
  const msg = 'should be an updated edges';

  const instance = createInstance({ nodes: createNodes(2), edges: [] });
  const actual = instance.updateEdges();

  assert.notDeepEqual(actual, instance.edges, msg);
  assert.end();
});

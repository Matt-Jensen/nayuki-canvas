const test = require('tape');
const createNodes = require('./helpers/create').createNodes;
const getNodeTrajectory = require('../tmp/update-nodes').getNodeTrajectory;
const getNodeOpacity = require('../tmp/update-nodes').getNodeOpacity;
const updateNodes = require('../tmp/update-nodes').default;
const canvasElem = {
  width: 100,
  height: 100
};
const idealNumNodes = 2;
const driftSpeed = 1;
const config = {
  FADE_IN_RATE: 0.06,
  FADE_OUT_RATE: 0.03,
  BORDER_FADE: -0.02
};
const createInstance = (...include) =>
  Object.assign({ canvasElem, idealNumNodes, driftSpeed }, config, { updateNodes }, ...include);

test('`getNodeTrajectory` should not update given node', assert => {
  const msg = 'should not update node';
  const node = { posX: 1, posY: 1, velX: 1, velY: 1 };

  getNodeTrajectory(node, 1);
  const actual = node;
  const expected = { posX: 1, posY: 1, velX: 1, velY: 1 };

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`getNodeTrajectory` should create updated trajectory', assert => {
  const msg = 'should be new trajectory';
  const node = { posX: 1, posY: 1, velX: 1, velY: 1 };

  const actual = getNodeTrajectory(node, 1);

  assert.notDeepEqual(actual, node, msg);
  assert.end();
});

test('`getNodeOpacity` should not update given opacity', assert => {
  const msg = 'opacity should be unchanged';
  let opacity = 0.5;

  getNodeOpacity(true, opacity, 0.06, 0.03);
  const actual = opacity;
  const expected = 0.5;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`getNodeOpacity` should reduce opacity if fading out', assert => {
  const msg = 'opacity should be reduced';

  const actual = getNodeOpacity(true, 0.5, 0.06, 0.03) < 0.5;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`getNodeOpacity` should increase opacity if fading in', assert => {
  const msg = 'opacity should be increased';

  const actual = getNodeOpacity(false, 0.5, 0.06, 0.03) > 0.5;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`updateNodes` should not update instance nodes', assert => {
  const msg = 'should not have updated nodes';
  const nodes = createNodes(1);
  const instance = createInstance({ nodes });

  const actual = nodes;
  const expected = createNodes(1);

  instance.updateNodes();

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`updateNodes` should create an updated array of nodes', assert => {
  const msg = 'should not have updated nodes';
  const nodes = createNodes(1);
  const instance = createInstance({ nodes });

  const actual = instance.updateNodes();
  const notExpected = nodes;

  assert.notDeepEqual(actual, notExpected, msg);
  assert.end();
});

test('`updateNodes` should create new nodes when below ideal node count', assert => {
  const msg = 'should have new nodes';
  const nodes = createNodes(2);
  const instance = createInstance({ nodes });

  instance.idealNumNodes = 3;

  const actual = instance.updateNodes().length;
  const expected = instance.idealNumNodes;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`updateNodes` should create new nodes 0 velocity and opacity', assert => {
  const msg = 'should be blank node';
  const nodes = [];
  const instance = createInstance({ nodes });

  instance.idealNumNodes = 1;
  const newNode = instance.updateNodes()[0];

  const { velX, velY, opacity } = newNode;

  assert.same(velX, 0, msg);
  assert.same(velY, 0, msg);
  assert.same(opacity, 0, msg);
  assert.end();
});

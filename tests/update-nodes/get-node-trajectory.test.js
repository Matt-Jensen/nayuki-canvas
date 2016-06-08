const test = require('tape');
const getNodeTrajectory = require('../../tmp/update-nodes/get-node-trajectory');
const { createNodes } = require('../helpers/create');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!getNodeTrajectory;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'should not update parameter';

  const [actual] = createNodes();
  const expected = JSON.parse(JSON.stringify(actual)); // clone
  const driftSpeed = 1;

  getNodeTrajectory(actual, driftSpeed);

  assert.deepEqual(actual, expected, msg);
  assert.equal(driftSpeed, 1, msg);
  assert.end();
});

test('should be idempotent for `posX` & `posY`', assert => {
  const msg = 'should be same trajectory positions';

  const first = getNodeTrajectory(createNodes()[0], 1);
  const second = getNodeTrajectory(createNodes()[0], 1);

  assert.equal(first.posX, second.posX, msg);
  assert.equal(first.posY, second.posY, msg);
  assert.end();
});

test('should create updated trajectory', assert => {
  const msg = 'is new trajectory';
  const node = { posX: 1, posY: 1, velX: 1, velY: 1 };

  const actual = getNodeTrajectory(node, 1);

  assert.notDeepEqual(actual, node, msg);
  assert.end();
});

test('should increase trajectory when driftSpeed is increased', assert => {
  const msg = 'has faster trajectory';

  const [node] = createNodes(1);
  const slower = getNodeTrajectory(node, 1);
  const faster = getNodeTrajectory(node, 10);

  assert.ok(slower.posX < faster.posX, msg);
  assert.ok(slower.posY < faster.posY, msg);
  assert.end();
});

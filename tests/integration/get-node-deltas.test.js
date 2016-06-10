const test = require('tape');
const getNodeDeltas = require('../../tmp/get-node-deltas');
const { createNodes } = require('../helpers/create');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!getNodeDeltas;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = '`nodes` were updated';
  const actual = createNodes(2);
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  getNodeDeltas(actual, 1);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'deltas are the same';

  const nodes = [].concat(createNodes(1), createNodes(1, { posX: 2, posY: 2}));
  const repulsionForce = 0.0001;
  const actual = getNodeDeltas(nodes, repulsionForce);
  const expected = getNodeDeltas(nodes, repulsionForce);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return an array of deltas', assert => {
  const msg = 'did not provide correct array of deltas';
  const nodes = [].concat(createNodes(1), createNodes(1, { posX: 2, posY: 2 }));
  const actual = getNodeDeltas(nodes, 0.00001);
  const expected = [
    -0.0000035355162283515956,
    -0.0000035355162283515956,
    0.0000035355162283515956,
    0.0000035355162283515956
  ];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return different deltas for different node positions', assert => {
  const msg = 'did not produce different deltas';
  const nodes1 = [].concat(createNodes(1), createNodes(1, { posX: 2, posY: 2 }));
  const nodes2 = [].concat(createNodes(1), createNodes(1, { posX: 3, posY: 3 }));
  const actual1 = getNodeDeltas(nodes1, 0.00001);
  const actual2 = getNodeDeltas(nodes2, 0.00001);

  assert.notDeepEqual(actual1, actual2, msg);
  assert.end();
});

test('should provide deltas proportional to nodes given', assert => {
  const msg = 'did not produce proportional amount of deltas';
  let nodes, actual, expected;

  nodes = [].concat(createNodes(1), createNodes(1, { posX: 2, posY: 2 }));
  actual = getNodeDeltas(nodes, 0.00001).length;
  expected = 4;

  assert.equal(actual, expected, msg);

  nodes = [].concat(createNodes(1), createNodes(1, { posX: 2, posY: 2 }), createNodes(1, { posX: 3, posY: 3 }));
  actual = getNodeDeltas(nodes, 0.00001).length;
  expected = 6;

  assert.equal(actual, expected, msg);
  assert.end();
});

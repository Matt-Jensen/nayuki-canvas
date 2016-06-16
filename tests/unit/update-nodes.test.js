const test = require('tape');
const { createNodes } = require('../helpers/create');
const updateNodes = require('../../tmp/update-nodes');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!updateNodes;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'has not changed';

  const actual = [createNodes(1), 2, 100, 100];
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  updateNodes(...actual);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create an updated array of nodes', assert => {
  const msg = 'should not have updated nodes';
  const nodes = createNodes(1);

  const actual = updateNodes(nodes, 2, 100, 100);
  const notExpected = nodes;

  assert.notDeepEqual(actual, notExpected, msg);
  assert.end();
});

test('should create new nodes when below `idealnodeCount`', assert => {
  const msg = 'has new nodes';
  const idealnodeCount = 3;

  const actual = updateNodes(createNodes(2), idealnodeCount, 100, 100).length;
  const expected = idealnodeCount;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return more nodes when `idealnodeCount` is higher', assert => {
  const msg = '`moreNodes` is greater than `lessNodes`';

  const { length: lessNodes } = updateNodes(createNodes(99), 10, 100, 100); // 10 = idealnodeCount
  const { length: moreNodes } = updateNodes(createNodes(99), 100, 100, 100); // 100 = idealnodeCount

  assert.ok(lessNodes < moreNodes, msg);
  assert.end();
});

test('should not return old invisible nodes', assert => {
  const msg = 'resolved only visible nodes';

  const [visibleNode] = createNodes(1, { opacity: 0.5 });
  const [invisibleNode] = createNodes(1, { opacity: 0 });
  const expected = 2;
  const result = updateNodes([invisibleNode, visibleNode], expected, 100, 100);
  const { length: actual } = result.filter(n => n !== invisibleNode); // keep nodes !== invisibleNode

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should create new nodes with 0 velocity and opacity', assert => {
  const msg = 'should be blank node';

  const actual = updateNodes([], 1, 100, 100)[0]; // no current nodes, idealnodeCount = 1
  const { velX, velY, opacity } = actual;

  assert.same(velX, 0, msg);
  assert.same(velY, 0, msg);
  assert.same(opacity, 0, msg);
  assert.end();
});

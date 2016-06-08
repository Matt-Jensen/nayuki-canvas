const test = require('tape');
const { createNodes } = require('./helpers/create');
const updateNodes = require('../tmp/update-nodes');

const settings = {
  idealNumNodes: 2,
  BORDER_FADE: -0.02,
  relWidth: 100,
  relHeight: 100
};

const createInstance = (...conf) =>
  Object.assign(Object.create({ updateNodes }), settings, ...conf);

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!updateNodes;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'has not changed';
  const nodes = createNodes(1);

  const actual = createInstance({ nodes });
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  actual.updateNodes();

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create an updated array of nodes', assert => {
  const msg = 'should not have updated nodes';
  const nodes = createNodes(1);
  const instance = createInstance({ nodes });

  const actual = instance.updateNodes();
  const notExpected = nodes;

  assert.notDeepEqual(actual, notExpected, msg);
  assert.end();
});

test('should create new nodes when below `idealNumNodes`', assert => {
  const msg = 'has new nodes';
  const nodes = createNodes(2);
  const instance = createInstance({ nodes });

  instance.idealNumNodes = 3;

  const actual = instance.updateNodes().length;
  const expected = instance.idealNumNodes;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return more nodes when `idealNumNodes` is higher', assert => {
  const msg = '`moreNodes` is greater than `lessNodes`';

  const { length: lessNodes } = createInstance({ nodes: createNodes(99), idealNumNodes: 10 }).updateNodes();
  const { length: moreNodes } = createInstance({ nodes: createNodes(99), idealNumNodes: 100 }).updateNodes();

  assert.ok(lessNodes < moreNodes, msg);
  assert.end();
});

test('should not return old invisible nodes', assert => {
  const msg = 'resolved only visible nodes';

  const [visibleNode] = createNodes(1, { opacity: 0.5 });
  const [invisibleNode] = createNodes(1, { opacity: 0 });
  const expected = 2;
  const result = createInstance({ nodes: [invisibleNode, visibleNode], idealNumNodes: expected }).updateNodes();
  const { length: actual } = result.filter(n => n !== invisibleNode);

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should create new nodes with 0 velocity and opacity', assert => {
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

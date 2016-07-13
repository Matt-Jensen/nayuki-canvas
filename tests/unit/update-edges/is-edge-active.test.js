const { test } = require('tap');
const isEdgeActive = require('../../../tmp/update-edges/is-edge-active');
const { createEdges } = require('../../helpers/create');
const { assign } = require('lodash');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!isEdgeActive;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'should not change';

  const actual = { opacity: 0.5, nodeA: { opacity: 0.5 }, nodeB: { opacity: 0.5 } };
  const expected = assign({}, actual);

  isEdgeActive(actual);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'result is the same';

  const actual = isEdgeActive(createEdges());
  const expected = isEdgeActive(createEdges());

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return false if any edge opacities are not positive', assert => {
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

test('should return true if all edge opacities are positive', assert => {
  const msg = 'should be true';

  const edge = { opacity: 0.5, nodeA: { opacity: 0.5 }, nodeB: { opacity: 0.5 } };
  const actual = isEdgeActive(edge);
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

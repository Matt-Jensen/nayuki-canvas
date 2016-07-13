const { test } = require('tap');
const properties = require('../../tmp/properties');
const defaults = require('../../tmp/defaults');
const _canvasElem = { width: 100, height: 100 };
const { assign } = require('lodash');

const { keys } = Object;

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!properties;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should consist of pure accessor property function', assert => {
  const msg = 'is not changed';

  const actual = assign({}, { _canvasElem }, defaults);
  const expected = JSON.parse(JSON.stringify(actual));

  keys(properties).forEach(function (property) {
    properties[property].get.call(actual);
  });

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should consist of idempotent accessor property functions', assert => {
  const msg = 'are the same';

  let instance;
  const actual = {};
  const expected = {};

  instance = assign({}, { _canvasElem }, defaults);

  keys(properties).forEach(function (property) {
    actual[property] = properties[property].get.call(instance);
  });

  instance = assign({}, { _canvasElem }, defaults);

  keys(properties).forEach(function (property) {
    expected[property] = properties[property].get.call(instance);
  });

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should throw an error when `_idealnodeCount` resolves `NaN` from `nodeCount`', assert => {
  const msg = 'throws an error';

  const actual = () => properties._idealnodeCount.get.call({ nodeCount: false });

  assert.throws(actual, msg);
  assert.end();
});

test('should return a number representing `_idealnodeCount`', assert => {
  const msg = 'is a number';

  const actual = typeof properties._idealnodeCount.get.call({ nodeCount: '10' });
  const expected = 'number';

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should throw an error when `_maxExtraEdges` resolves `NaN` from `nodeCount`', assert => {
  const msg = 'throws an error';

  const actual = () => properties._maxExtraEdges.get.call({ nodeCount: false, extraEdges: 100 });

  assert.throws(actual, msg);
  assert.end();
});

test('should throw an error when `_maxExtraEdges` resolves `NaN` from `extraEdges`', assert => {
  const msg = 'throws an error';

  const actual = () => properties._maxExtraEdges.get.call({ nodeCount: 100, extraEdges: false });

  assert.throws(actual, msg);
  assert.end();
});

test('should return a number representing `_maxExtraEdges`', assert => {
  const msg = 'is a number';

  const actual = typeof properties._maxExtraEdges.get.call({ nodeCount: '10', extraEdges: '100' });
  const expected = 'number';

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `0.5` from `_radiiWeightPower` when `network` is `undefined`', assert => {
  const msg = 'is `0.5`';

  const actual = properties._radiiWeightPower.get.call({ network: undefined });
  const expected = 0.5;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `0` from `_radiiWeightPower` when `network` is `mesh`', assert => {
  const msg = 'is `0`';

  const actual = properties._radiiWeightPower.get.call({ network: 'mesh' });
  const expected = 0;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `1` from `_radiiWeightPower` when `network` is `wheel`', assert => {
  const msg = 'is `1`';

  const actual = properties._radiiWeightPower.get.call({ network: 'wheel' });
  const expected = 1;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should throw an error when `_repulsionForce` resolves `NaN` from `repulsion`', assert => {
  const msg = 'throws an error';

  const actual = () => properties._repulsionForce.get.call({ repulsion: false });

  assert.throws(actual, msg);
  assert.end();
});

test('should return a number representing `_repulsionForce`', assert => {
  const msg = 'is a number';

  const actual = typeof properties._repulsionForce.get.call({ repulsion: 1 });
  const expected = 'number';

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return a `_relWidth` between `0` and `1`', assert => {
  const msg = '>= `0` and <= `1`';

  const wide = { width: 100, height: 1 };
  const tall = { width: 1, height: 100 };

  assert.ok(properties._relWidth.get.call({ _canvasElem: tall }) > 0, msg);
  assert.ok(properties._relWidth.get.call({ _canvasElem: wide }) <= 1, msg);
  assert.end();
});

test('should return a `_relHeight` between `0` and `1`', assert => {
  const msg = '>= `0` and <= `1`';

  const wide = { width: 100, height: 1 };
  const tall = { width: 1, height: 100 };

  assert.ok(properties._relHeight.get.call({ _canvasElem: tall }) <= 1, msg);
  assert.ok(properties._relHeight.get.call({ _canvasElem: wide }) > 0, msg);
  assert.end();
});

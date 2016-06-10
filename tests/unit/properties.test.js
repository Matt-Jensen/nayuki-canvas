const test = require('tape');
const properties = require('../../tmp/properties');
const defaults = require('../../tmp/defaults');
const canvasElem = { width: 100, height: 100 };

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!properties;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should consist of pure accessor property function', assert => {
  const msg = 'is not changed';

  const actual = Object.assign({}, { canvasElem }, defaults);
  const expected = JSON.parse(JSON.stringify(actual));

  Object.keys(properties).forEach(function (property) {
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

  instance = Object.assign({}, { canvasElem }, defaults);

  Object.keys(properties).forEach(function (property) {
    actual[property] = properties[property].get.call(instance);
  });

  instance = Object.assign({}, { canvasElem }, defaults);

  Object.keys(properties).forEach(function (property) {
    expected[property] = properties[property].get.call(instance);
  });

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should throw an error when `idealNumNodes` resolves `NaN` from `numNodes`', assert => {
  const msg = 'throws an error';

  const actual = () => properties.idealNumNodes.get.call({ numNodes: false });

  assert.throws(actual, msg);
  assert.end();
});

test('should return a number representing `idealNumNodes`', assert => {
  const msg = 'is a number';

  const actual = typeof properties.idealNumNodes.get.call({ numNodes: '10' });
  const expected = 'number';

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should throw an error when `maxExtraEdges` resolves `NaN` from `numNodes`', assert => {
  const msg = 'throws an error';

  const actual = () => properties.maxExtraEdges.get.call({ numNodes: false, extraEdges: 100 });

  assert.throws(actual, msg);
  assert.end();
});

test('should throw an error when `maxExtraEdges` resolves `NaN` from `extraEdges`', assert => {
  const msg = 'throws an error';

  const actual = () => properties.maxExtraEdges.get.call({ numNodes: 100, extraEdges: false });

  assert.throws(actual, msg);
  assert.end();
});

test('should return a number representing `maxExtraEdges`', assert => {
  const msg = 'is a number';

  const actual = typeof properties.idealNumNodes.get.call({ numNodes: '10', extraEdges: '100' });
  const expected = 'number';

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `0.5` from `radiiWeightPower` when `networkStyle` is `undefined`', assert => {
  const msg = 'is `0.5`';

  const actual = properties.radiiWeightPower.get.call({ networkStyle: undefined });
  const expected = 0.5;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `0` from `radiiWeightPower` when `networkStyle` is `mesh`', assert => {
  const msg = 'is `0`';

  const actual = properties.radiiWeightPower.get.call({ networkStyle: 'mesh' });
  const expected = 0;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `1` from `radiiWeightPower` when `networkStyle` is `wheel`', assert => {
  const msg = 'is `1`';

  const actual = properties.radiiWeightPower.get.call({ networkStyle: 'wheel' });
  const expected = 1;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should throw an error when `repulsionForce` resolves `NaN` from `repulsion`', assert => {
  const msg = 'throws an error';

  const actual = () => properties.repulsionForce.get.call({ repulsion: false });

  assert.throws(actual, msg);
  assert.end();
});

test('should return a number representing `repulsionForce`', assert => {
  const msg = 'is a number';

  const actual = typeof properties.repulsionForce.get.call({ repulsion: 1 });
  const expected = 'number';

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return a `relWidth` between `0` and `1`', assert => {
  const msg = '>= `0` and <= `1`';

  const wide = { width: 100, height: 1 };
  const tall = { width: 1, height: 100 };

  assert.ok(properties.relWidth.get.call({ canvasElem: tall }) > 0, msg);
  assert.ok(properties.relWidth.get.call({ canvasElem: wide }) <= 1, msg);
  assert.end();
});

test('should return a `relHeight` between `0` and `1`', assert => {
  const msg = '>= `0` and <= `1`';

  const wide = { width: 100, height: 1 };
  const tall = { width: 1, height: 100 };

  assert.ok(properties.relHeight.get.call({ canvasElem: tall }) <= 1, msg);
  assert.ok(properties.relHeight.get.call({ canvasElem: wide }) > 0, msg);
  assert.end();
});
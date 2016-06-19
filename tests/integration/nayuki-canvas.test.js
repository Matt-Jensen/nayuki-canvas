const nayukiCanvas = require('../../tmp/nayuki-canvas');
const test = require('tape');
const stripMethods = (o) => JSON.parse(JSON.stringify(o));

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!nayukiCanvas;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'property were updated';

  const actual = {
    extraEdges: 21,
    nodeCount: 71,
    network: 'mesh',
    repulsion: 10,
    borderFade: -0.04,
    fadeInRate: 0.16,
    fadeOutRate: 0.13,
    frameInterval: 25
  };
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  nayukiCanvas({}, actual);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'results are the same';

  const config = { extraEdges: 40 };
  const actual = stripMethods(nayukiCanvas({}, config));
  const expected = stripMethods(nayukiCanvas({}, config));

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should have `isSupported` method in `nayukiCanvas` namespace', assert => {
  const msg = '`isSupported` is a method in namespace';

  const actual = typeof nayukiCanvas.isSupported;
  const expected = 'function';

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should have `start` and `stop` instance methods', assert => {
  const msg = 'method exists';

  const instance = nayukiCanvas();
  assert.equal(typeof instance.start, 'function', msg);
  assert.equal(typeof instance.stop, 'function', msg);
  assert.end();
});

test('should support chaining via `start`', assert => {
  const msg = 'returns `this`';

  const expected = nayukiCanvas();
  expected.setTimeout = function () {};

  const actual = expected.start();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should invoke `next` via `setTimeout` from `start`', assert => {
  const msg = '`next` was invoked';

  const instance = nayukiCanvas();
  let actual = false;
  const expected = true;

  instance.setTimeout = function () {
    actual = true;
  };

  instance.start();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should pass `frameInterval` to `setTimeout` via `start`', assert => {
  const msg = 'passed `frameInterval`';

  let actual;
  const expected = 20;

  const instance = nayukiCanvas({}, { frameInterval: expected });
  instance.setTimeout = (fn, interval) => { actual = interval; };

  instance.start();

  assert.equal(actual, expected, msg);
  assert.end();
});

// test('should not invoke `next` on subsequent invokations of `start`', assert => { });

test('should support chaining via `stop`', assert => {
  const msg = 'returns `this`';

  const expected = nayukiCanvas();
  const actual = expected.stop();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should invoke `clearTimeout` via `stop`', assert => {
  const msg = 'was invoked';

  let actual = false;
  const expected = true;

  const instance = nayukiCanvas();
  instance.clearTimeout = () => { actual = true; };

  instance.stop();

  assert.equal(actual, expected, msg);
  assert.end();
});

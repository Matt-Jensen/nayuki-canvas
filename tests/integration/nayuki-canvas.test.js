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
    numNodes: 71,
    networkStyle: 'mesh',
    repulsion: 10,
    BORDER_FADE: -0.04,
    FADE_IN_RATE: 0.16,
    FADE_OUT_RATE: 0.13,
    FRAME_INTERVAL: 25
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
  expected.setInterval = function () {};

  const actual = expected.start();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should invoke `next` via `setInterval` from `start`', assert => {
  const msg = '`next` was invoked';

  const instance = nayukiCanvas();
  let actual = false;
  const expected = true;

  instance.setInterval = function () {
    actual = true;
  };

  instance.start();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should pass `FRAME_INTERVAL` to `setInterval` via `start`', assert => {
  const msg = 'passed `FRAME_INTERVAL`';

  let actual;
  const expected = 20;

  const instance = nayukiCanvas({}, { FRAME_INTERVAL: expected });
  instance.setInterval = (fn, interval) => { actual = interval; };

  instance.start();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should support chaining via `stop`', assert => {
  const msg = 'returns `this`';

  const expected = nayukiCanvas();
  const actual = expected.stop();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should invoke `clearInterval` via `stop`', assert => {
  const msg = 'was invoked';

  let actual = false;
  const expected = true;

  const instance = nayukiCanvas();
  instance.clearInterval = () => { actual = true; };

  instance.stop();

  assert.equal(actual, expected, msg);
  assert.end();
});

const nayukiCanvas = require('../tmp/nayuki-canvas');
const test = require('tape');

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
  const actual = nayukiCanvas({}, config);
  const expected = nayukiCanvas({}, config);

  // are different
  delete actual.start;
  delete expected.start;
  delete actual.stop;
  delete expected.stop;

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

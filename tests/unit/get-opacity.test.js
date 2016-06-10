const test = require('tape');
const getOpacity = require('../../tmp/get-opacity');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!getOpacity;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'is not changed';

  const isFadingIn = true;
  const input = { opacity: 0.5 };
  const FADE_IN_RATE = 0.05;
  const FADE_OUT_RATE = 0.05;

  getOpacity(isFadingIn, input, FADE_IN_RATE, FADE_OUT_RATE);

  assert.equal(isFadingIn, true, msg);
  assert.deepEqual(input, { opacity: 0.5 }, msg);
  assert.equal(FADE_IN_RATE, 0.05, msg);
  assert.equal(FADE_OUT_RATE, 0.05, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'opacities are the same';
  const i = { opacity: 0.5 };
  const fIn = 0.05;
  const fOut = 0.05;

  assert.equal(getOpacity(true, i, fIn, fOut), getOpacity(true, i, fIn, fOut), msg);
  assert.equal(getOpacity(false, i, fIn, fOut), getOpacity(false, i, fIn, fOut), msg);
  assert.end();
});

test('should resolve instance `FADE_IN_RATE` if none given', assert => {
  const msg = 'resolved instance `FADE_IN_RATE`';
  const instance = { FADE_IN_RATE: 0.1 };

  const actual = getOpacity.apply(instance, [true, { opacity: 0.5 }]);
  const expected = 0.6;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should resolve instance `FADE_OUT_RATE` if none given', assert => {
  const msg = 'resolved instance `FADE_IN_RATE`';
  const instance = { FADE_OUT_RATE: 0.1 };

  const actual = getOpacity.apply(instance, [false, { opacity: 0.5 }]);
  const expected = 0.4;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should increase opacity when fading in', assert => {
  const msg = 'increases edge opacity';

  const actual = getOpacity(true, { opacity: 0.5 }, 0.05, 0.05);
  const expected = 0.55;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should decrease opacity when fading out', assert => {
  const msg = 'decreases edge opacity';

  const actual = getOpacity(false, { opacity: 0.5 }, 0.05, 0.05);
  const expected = 0.45;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should fade in faster when `FADE_IN_RATE` is higher', assert => {
  const msg = 'has higher rate of opacity increase';

  const slower = getOpacity(true, { opacity: 0.5 }, 0.05, 0.05);
  const faster = getOpacity(true, { opacity: 0.5 }, 0.1, 0.05);

  assert.ok(slower < faster, msg);
  assert.end();
});

test('should fade out faster when `FADE_OUT_RATE` is higher', assert => {
  const msg = 'has higher rate of opacity increase';

  const faster = getOpacity(false, { opacity: 0.5 }, 0.05, 0.1);
  const slower = getOpacity(false, { opacity: 0.5 }, 0.05, 0.05);

  assert.ok(faster < slower, msg);
  assert.end();
});

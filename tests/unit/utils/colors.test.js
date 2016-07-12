const { test } = require('tap');
const color = require('../../../tmp/utils/color');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!color;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should consist of pure functions', assert => {
  const msg = 'did not updated arguments';
  const actual = '#fff';
  const expected = '#fff';

  Object.keys(color).forEach(m => color[m](actual));

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should consist of idempotent methods', assert => {
  const msg = 'results should be the same';

  const value = '#fff';
  Object.keys(color).forEach(m => {
    assert.equal(color[m](value), color[m](value), msg);
  });

  assert.end();
});

test('should convert `hex` values to full valid form with `_validatedHex`', assert => {
  const msg = 'is valid hex form';

  const short = '#fff';
  const noHash = 'fff';
  const longHash = '#ffffff';
  const longNoHash = 'ffffff';

  const expected = 'ffffff';

  assert.equal(color._validatedHex(short), expected, msg);
  assert.equal(color._validatedHex(noHash), expected, msg);
  assert.equal(color._validatedHex(longHash), expected, msg);
  assert.equal(color._validatedHex(longNoHash), expected, msg);
  assert.end();
});

test('should validate hex value before converting it to RGB', assert => {
  const msg = '`_validatedHex` was called';

  let actual = false;
  const expected = true;

  const stubValidatedHex = (hex) => {
    actual = true;
    return hex;
  };

  const originalValidatedHex = color._validatedHex;
  color._validatedHex = stubValidatedHex;

  color.hexToRGB('#fff');

  assert.equal(actual, expected, msg);

  color._validatedHex = originalValidatedHex;
  assert.end();
});

test('should correctly convert hex values to RGB equivalents', assert => {
  const msg = 'are correct RGB values';

  let actual = ['f2f', '#e0d4f8', 345678];
  const expected = ['255,34,255', '224,212,248', '52,86,120'];

  actual = actual.map(color.hexToRGB, color);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

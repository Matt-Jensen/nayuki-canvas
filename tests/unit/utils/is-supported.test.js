/*eslint no-native-reassign: 0 */

const test = require('tape');
const isSupported = require('../../../tmp/utils/is-supported');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!isSupported;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be false without global `document`', assert => {
  const msg = 'is based on `document` existance';

  const originalDocument = (typeof document === 'object' ? document : undefined);
  document = false;

  const actual = isSupported();
  const expected = false;
  assert.equal(actual, expected, msg);

  document = originalDocument;
  assert.end();
});

test('should be `false` when canvas cannot create a 2D context', assert => {
  const msg = 'false indicates 2D context is unsupported';

  const originalDocument = (typeof document === 'object' ? document : undefined);
  document = {
    createElement () {
      return {
        getContext: false
      };
    }
  };

  const actual = isSupported();
  const expected = false;

  assert.equal(actual, expected, msg);

  document = originalDocument;
  assert.end();
});

test('should be `true` when canvas creates a 2D context', assert => {
  const msg = 'true indicates 2D context is supported';

  const originalDocument = (typeof document === 'object' ? document : undefined);
  document = {
    createElement () {
      return {
        getContext () {
          return true;
        }
      };
    }
  };

  const actual = isSupported();
  const expected = true;

  assert.equal(actual, expected, msg);

  document = originalDocument;
  assert.end();
});

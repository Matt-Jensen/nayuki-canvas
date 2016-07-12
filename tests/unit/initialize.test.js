const { test } = require('tap');
const initialize = require('../../tmp/initialize');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!initialize;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should invoke instance `next` method', assert => {
  const msg = 'did invoke `next`';

  let actual = false;
  const expected = true;

  initialize.call({ next: () => { actual = true; } });

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should support chaining', assert => {
  const msg = 'returned `this`';

  const expected = { next: function () {} };
  const actual = initialize.call(expected);

  assert.equal(actual, expected, msg);
  assert.end();
});

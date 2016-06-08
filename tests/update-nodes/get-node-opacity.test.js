const test = require('tape');
const getNodeOpacity = require('../../tmp/update-nodes/get-node-opacity');

test('should not update given opacity', assert => {
  const msg = 'opacity should be unchanged';
  let opacity = 0.5;

  getNodeOpacity(true, opacity, 0.06, 0.03);
  const actual = opacity;
  const expected = 0.5;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should reduce opacity if fading out', assert => {
  const msg = 'opacity should be reduced';

  const actual = getNodeOpacity(true, 0.5, 0.06, 0.03) < 0.5;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should increase opacity if fading in', assert => {
  const msg = 'opacity should be increased';

  const actual = getNodeOpacity(false, 0.5, 0.06, 0.03) > 0.5;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

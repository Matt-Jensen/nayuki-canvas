const test = require('tape');
const nayukiCanvas = require('../../tmp/nayuki-canvas');

test('should be running in a browser', assert => {
  assert.ok(document && nayukiCanvas, 'we did the thing!');
  assert.end();
});

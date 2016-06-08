const test = require('tape');
const canvasBackground = require('../../tmp/redraw-canvas/canvas-background');
const mockGraphics = require('../helpers/mock-graphics');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!canvasBackground;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be and provide pure functions', assert => {
  const msg = 'configuration was not updated';
  const actual = {
    width: 100,
    height: 100,
    size: 100,
    graphics: mockGraphics(),
    startColor: '#fff',
    stopColor: '#fff'
  };
  const expected = Object.assign({}, actual); // clone

  const cb = canvasBackground(actual);

  // invoke all enumerables
  Object.keys(cb).forEach(k => cb[k]);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

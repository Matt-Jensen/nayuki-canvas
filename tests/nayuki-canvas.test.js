const nayukiCanvas = require('../tmp/nayuki-canvas');
const test = require('tape');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!nayukiCanvas;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

// TODO make nayukiCanvas factory node friendly
// test('should have a pure `create` function', assert => {
//   const msg = 'property were updated';
//   const actual = {
//     extraEdges: 21,
//     numNodes: 71,
//     networkStyle: 'mesh',
//     repulsion: 10,
//     BORDER_FADE: -0.04,
//     FADE_IN_RATE: 0.16,  // In the range (0.0, 1.0]
//     FADE_OUT_RATE: 0.13,  // In the range (0.0, 1.0]
//     FRAME_INTERVAL: 25  // In milliseconds
//   };
//   const expected = JSON.parse(JSON.stringify(actual)); // clone
//
//   nayukiCanvas.create({}, actual);
//
//   assert.deepEqual(actual, expected, msg);
//   assert.end();
// });

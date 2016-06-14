const test = require('tape');
const nayukiCanvas = require('../../tmp/nayuki-canvas');
const { createCanvas } = require('../helpers/create');
const nayukiQuery = require('../helpers/nayuki-query');

test('should render configured background color', assert => {
  const msg = 'renders configured red HEX background to red RGB';

  const canvas = createCanvas(100, 100, { background: '#fff' });
  const instance = nayukiCanvas(canvas, { background: '#f44336', numNodes: 0 });
  const nq = nayukiQuery(instance);

  nq.insertCanvas();
  instance.next(); // invoke one frame render
  assert.equal(nq.colorAt(1, 1), 'rgba(244,67,54,255)', msg);

  nq.removeCanvas();
  assert.end();
});

// TODO write remaining E2E tests
// test('should render correct background radial gradient', assert => {});
// test('should render correct background linear gradient', assert => {});
// test('should render correct number of nodes (2)', assert => {});
// test('should render correct number of edges (3)', assert => {});
// test('should render correct node color', assert => {});
// test('should render correct edge color', assert => {});
// test('should update frame on each `frameInterval`', assert => {});
// test('should update frame after calling `start`', assert => {});
// test('should stop updating frame after calling `stop` ', assert => {});
// test('should remove canvas on `destroy`', assert => {});

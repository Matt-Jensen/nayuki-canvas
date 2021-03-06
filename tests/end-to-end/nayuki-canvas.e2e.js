const test = require('tape');
const nayukiCanvas = require('../../tmp/nayuki-canvas');
const { createCanvas } = require('../helpers/create');
const nayukiQuery = require('../helpers/nayuki-query');
const deepClone = c => JSON.parse(JSON.stringify(c));

const { assign } = require('lodash');

test('should render configured background color', assert => {
  const msg = 'renders red RGB background';

  const canvas = createCanvas(100, 100, { background: '#ccc' });
  const instance = nayukiCanvas(canvas, { background: '#f44336', nodeCount: 0 });
  const nq = nayukiQuery(instance);

  instance.next(); // render frame
  assert.equal(nq.colorAt(1, 1), 'rgba(244,67,54,255)', msg);

  assert.end();
});

test('should render configured background radial gradient', assert => {
  const msg = 'renders the center red, left black gradient background';

  const canvas = createCanvas(1000, 1000, { background: '#ccc' });
  const instance = nayukiCanvas(canvas, { background: ['#f44336', '#000000'], gradient: 'linear', nodeCount: 0 });
  const nq = nayukiQuery(instance);

  instance.next(); // render frame

  const actualTop = nq.colorAt(0, 1);
  const expectedTops = [
    'rgba(244,67,54,255)', // most browsers
    'rgba(243,67,54,255)' // special snowflake Firefox
  ];

  assert.ok(expectedTops.indexOf(actualTop) !== -1, msg);

  const actualBottom = nq.colorAt(0, 999);
  const expectedBottom = 'rgba(0,0,0,255)';

  assert.equal(actualBottom, expectedBottom, msg);
  assert.end();
});

test('should render configured background linear gradient', assert => {
  const msg = 'renders the top red, bottom black linear gradient background';

  const canvas = createCanvas(1000, 1000, { background: '#ccc' });
  const instance = nayukiCanvas(canvas, { background: ['#f44336', '#000'], gradient: 'linear', nodeCount: 0 });
  const nq = nayukiQuery(instance);

  instance.next(); // render frame

  const actualTop = nq.colorAt(0, 1);
  const expectedTops = [
    'rgba(244,67,54,255)', // most browsers
    'rgba(243,67,54,255)' // special snowflake Firefox
  ];

  assert.ok(expectedTops.indexOf(actualTop) !== -1, msg);

  const actualBottom = nq.colorAt(0, 999);
  const expectedBottom = 'rgba(0,0,0,255)';

  assert.equal(actualBottom, expectedBottom, msg);
  assert.end();
});

test('should render configured node color', assert => {
  const msg = 'renders a white node';

  const canvas = createCanvas(100, 100, { background: '#ccc' });
  const instance = nayukiCanvas(canvas, { background: '#000', nodeCount: 1, nodeSize: 100000, nodeColor: '#fff' });
  const nq = nayukiQuery(instance);

  instance.next(); // generate node
  assign(instance._nodes[0], { posX: 0.5, posY: 0.5, opacity: 1 }); // place center
  instance._redrawCanvas(); // draw frame without manipulation

  assert.equal(nq.colorAt(50, 50), 'rgba(255,255,255,255)', msg);

  assert.end();
});

test('should render configured edge color', assert => {
  const msg = 'renders white edge';

  const canvas = createCanvas(100, 100, { background: '#ccc' });
  const instance = nayukiCanvas(canvas, { background: '#000', nodeCount: 2, nodeSize: 100, nodeColor: '#000', edgeColor: '#fff', edgeSize: 10000 });
  const nq = nayukiQuery(instance);

  instance.next();
  assign(instance._nodes[0], { posX: 0, posY: 0.5, opacity: 1 }); // place center left
  assign(instance._nodes[1], { posX: 1, posY: 0.5, opacity: 1 }); // place center right
  assign(instance._edges[0], { nodeA: instance._nodes[0], nodeB: instance._nodes[1], opacity: 1 }); // connect to both nodes
  instance._redrawCanvas(); // draw frame without manipulation

  assert.equal(nq.colorAt(50, 50), 'rgba(255,255,255,255)', msg);
  assert.end();
});

test('should render configured number of nodes', assert => {
  const msg = 'renders 2 white nodes';

  const canvas = createCanvas(100, 100, { background: '#ccc' });
  const instance = nayukiCanvas(canvas, { background: '#000', nodeCount: 2, nodeSize: 10000, nodeColor: '#fff' });
  const nq = nayukiQuery(instance);

  instance.next(); // generate nodes
  assign(instance._nodes[0], { posX: 0, posY: 0.5, opacity: 1 }); // place center left
  assign(instance._nodes[1], { posX: 1, posY: 0.5, opacity: 1 }); // place center right
  instance._redrawCanvas(); // draw frame without manipulation

  assert.equal(nq.colorAt(1, 50), 'rgba(255,255,255,255)', msg);
  assert.equal(nq.colorAt(99, 50), 'rgba(255,255,255,255)', msg);

  assert.end();
});

test('should update frame on configured `frameInterval`', assert => {
  const msg = 'canvas frame was updated';
  assert.plan(1);

  const interval = 10;
  const canvas = createCanvas();
  const instance = nayukiCanvas(canvas, { frameInterval: interval });

  instance.next(); // generate initial frame
  const initial = deepClone(assign({}, { nodes: instance._nodes }, { edges: instance._edges }));

  instance.start();

  setTimeout(function () {
    const updated = deepClone(assign({}, { nodes: instance._nodes }, { edges: instance._edges }));
    assert.notDeepEqual(initial, updated, msg);
    instance.stop();
    assert.end();
  }, interval + 1);
});

test('should update frame after calling `start`', assert => {
  const msg = 'canvas frame was updated';
  assert.plan(1);

  const canvas = createCanvas();
  const instance = nayukiCanvas(canvas, { frameInterval: 0 });

  instance.next(); // generate initial frame
  const initial = deepClone(assign({}, { nodes: instance._nodes }, { edges: instance._edges }));

  instance.start();

  setTimeout(function () {
    const updated = deepClone(assign({}, { nodes: instance._nodes }, { edges: instance._edges }));
    assert.notDeepEqual(initial, updated, msg);
    instance.stop();
    assert.end();
  }, 1);
});

test('should stop updating frame after calling `stop` ', assert => {
  const msg = 'canvas frame stopped updating';
  assert.plan(1);

  const canvas = createCanvas();
  const instance = nayukiCanvas(canvas, { frameInterval: 0 });

  instance.next(); // generate initial frame
  let expected, actual;

  instance.start();

  setTimeout(function () {
    expected = deepClone(assign({}, { nodes: instance._nodes }, { edges: instance._edges }));
    instance.stop();
  }, 1);

  setTimeout(function () {
    actual = deepClone(assign({}, { nodes: instance._nodes }, { edges: instance._edges }));
    assert.deepEqual(expected, actual, msg);
    assert.end();
  }, 2);
});

test('should remove canvas instance on `destroy`', assert => {
  const msg = 'destroies rendered canvas';

  const canvas = createCanvas(100, 100, { background: '#ccc' });
  const instance = nayukiCanvas(canvas, { background: '#f44336', nodeCount: 0 });

  instance.next().destroy(); // render frame and remove
  assert.equal(instance._graphics, null, msg);

  assert.end();
});

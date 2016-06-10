const test = require('tape');
const redrawCanvas = require('../../tmp/redraw-canvas/index');
const { createNodes, createEdges } = require('../helpers/create');
const mockGraphics = require('../helpers/mock-graphics');
const mockCanvas = () => Object.assign({}, { width: 100, height: 100 });

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!redrawCanvas;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a mostly pure function, only updating graphics argument', assert => {
  const msg = 'arguments are unchanged';

  const actual = [createNodes(2), createEdges(2), mockCanvas()];
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  redrawCanvas(...actual, mockGraphics());

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should draw background with idempotence', assert => {
  const msg = 'recieved same `fillRect` and `fillStyle` arguments';

  let actual, expected, i = 0;
  const graphics = mockGraphics({
    fillRect (...args) {
      args = [].concat(args, [this.fillStyle]); // add current `fillStyle` to args

      if (i === 0) {
        actual = args;
        i++;
      } else {
        expected = args;
      }
    }
  });

  redrawCanvas(createNodes(), createEdges(), mockCanvas(), graphics);
  redrawCanvas(createNodes(), createEdges(), mockCanvas(), graphics);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should draw nodes with idempotence', assert => {
  const msg = 'recieved same `arc` arguments';

  let actual, expected, i = 0;
  const graphics = mockGraphics({
    arc (...args) {
      if (i === 0) {
        actual = args;
        i++;
      } else {
        expected = args;
      }
    }
  });

  redrawCanvas(createNodes(), createEdges(), mockCanvas(), graphics);
  redrawCanvas(createNodes(), createEdges(), mockCanvas(), graphics);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should draw each node in Canvas Frame `nodes`', assert => {
  const msg = 'has same number of nodes';

  const actual = [];
  const graphics = mockGraphics({
    arc () {
      actual.push(1); // invoked for each node
    }
  });

  // get Canvas Frame object
  const expected = redrawCanvas(createNodes(2), createEdges(), mockCanvas(), graphics);

  assert.equal(actual.length, expected.nodes.length, msg);
  assert.end();
});

test('should draw lines with idempotence', assert => {
  const msg = 'recieved same `moveTo` & `lineTo` arguments';

  let actual, expected, i = 0;
  const graphics = mockGraphics({
    moveTo (...args) {
      if (i === 0) {
        actual = args;
      } else {
        expected = args;
      }
    },
    lineTo (...args) {
      if (i === 0) {
        actual.push(...args);
        i++;
      } else {
        expected.push(...args);
      }
    }
  });

  // create 2 nodes far away
  const nodes = createNodes(1, { posX: 100, posY: 100 }).concat(createNodes(1));

  // create edge that connects them
  const edges = createEdges(1, { nodeA: nodes[0], nodeB: nodes[1] });

  redrawCanvas(nodes, edges, mockCanvas(), graphics);
  redrawCanvas(nodes, edges, mockCanvas(), graphics);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should draw each edge in Canvas Frame `edges`', assert => {
  const msg = 'has same number of edges';

  const actual = [];
  const graphics = mockGraphics({
    moveTo () {
      actual.push(1); // invoked for each edge
    }
  });

  // create 2 nodes far away
  const nodes = createNodes(1, { posX: 100, posY: 100 }).concat(createNodes(1));

  // create 1 valid edge that connects nodes
  const edges = createEdges(1, { nodeA: nodes[0], nodeB: nodes[1] }).concat(createEdges());


  // get Canvas Frame object
  const expected = redrawCanvas(nodes, edges, mockCanvas(), graphics);

  assert.equal(actual.length, expected.edges.length, msg);
  assert.end();
});

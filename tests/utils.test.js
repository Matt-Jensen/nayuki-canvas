/*eslint no-native-reassign: 0 */

const test = require('tape');
const utils = require('../tmp/utils');
const { containsEdge, calcSpanningTree, calcAllEdgeWeights, isSupported, getCanvasElement } = utils;
const { createNodes, createEdges } = require('./helpers/create');
let jQuery;

test('all utils should exist', assert => {
  const msg = 'exports 3 modules';
  const actual = !!(containsEdge && calcSpanningTree && calcAllEdgeWeights && isSupported && getCanvasElement);
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('`containsEdge` should be a pure function', assert => {
  const msg = 'did not updated arguments';
  const nodes = createNodes(2);
  const actual = {
    edge: createEdges(1, { nodeA: nodes[0], nodeB: nodes[1] }),
  };
  actual.allEdges = [].concat(createEdges(1), [actual.edge]);
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  containsEdge(actual.allEdges, actual.edge);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`containsEdge` should be idempotent', assert => {
  const msg = 'results should be the same';

  const actual = containsEdge([], {});
  const expected = containsEdge([], {});

  assert.same(actual, expected, msg);
  assert.end();
});

test('`containsEdge` should return false if edge not found', assert => {
  const msg = 'should return `false` for not found';

  const actual = containsEdge([], {});
  const expected = false;

  assert.same(actual, expected, msg);
  assert.end();
});

test('`containsEdge` should return true if edge found', assert => {
  const msg = 'should return `true` for found';

  const edge = { nodeA: {}, nodeB: {} };
  const actual = containsEdge([edge], edge);
  const expected = true;

  assert.same(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should be idempotent', assert => {
  const msg = 'results should be the same';

  const edges = [ ['', 0, 1] ];
  const nodes = [{ x: 1 }, { y: 2 }];
  const actual = calcSpanningTree(edges, nodes);
  const expected = calcSpanningTree(edges, nodes);

  assert.same(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should be a pure function', assert => {
  const msg = 'did not updated arguments';
  const actual = {
    edges: [ ['', 0, 1] ],
    nodes: [{ x: 1 }, { y: 2 }]
  };
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  calcSpanningTree(actual.edges, actual.nodes);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should return new array', assert => {
  const msg = 'should be new array';

  const edges = [];
  const nodes = [];
  const result = calcSpanningTree(edges, nodes);
  const actual = result !== edges && result !== nodes;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should return an array of new edge objects', assert => {
  const msg = 'should create new array of edges';

  const actual = calcSpanningTree([ ['', 0, 1] ], [{ x: 1 }, { y: 2 }]);
  const expected = [{
    nodeA: { x: 1 },
    nodeB: { y: 2 }
  }];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcSpanningTree` should not change inputs', assert => {
  const msg = 'should not change inputs';

  const actualEdges = [['', 0, 1]];
  const actualNodes = [{ x: 1 }, { y: 2 }];

  calcSpanningTree(actualEdges, actualNodes);

  const expectedEdges = [['', 0, 1]];
  const expectedNodes = [{ x: 1 }, { y: 2 }];

  assert.deepEqual(actualEdges, expectedEdges, msg);
  assert.deepEqual(actualNodes, expectedNodes, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should be a pure function', assert => {
  const msg = 'did not updated arguments';
  const actual = {
    nodes: createNodes(2),
    radiiWeightPower: 1
  };
  const expected = JSON.parse(JSON.stringify(actual)); // clone

  calcAllEdgeWeights(actual.nodes, actual.radiiWeightPower);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should be idempotent', assert => {
  const msg = 'results should be the same';

  const actual = calcAllEdgeWeights([], 1);
  const expected = calcAllEdgeWeights([], 1);

  assert.same(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should return new array', assert => {
  const msg = 'should be new array';

  const nodes = [];
  const result = calcAllEdgeWeights(nodes, 1);
  const actual = result !== nodes;
  const expected = true;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should return array of weighted edges', assert => {
  const msg = 'should be weighted edges array';

  const nodes = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];
  const actual = calcAllEdgeWeights(nodes, 1);
  const expected = [[0.7071067811865476, 1, 0]];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should not update inputs', assert => {
  const msg = 'should be not update `nodes`';

  const nodes = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];
  calcAllEdgeWeights(nodes, 1);

  const actual = nodes;
  const expected = [{ posX: 1, posY: 1, radius: 1 }, { posX: 2, posY: 2, radius: 2 }];

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`calcAllEdgeWeights` should sort edges weight', assert => {
  const msg = 'should be a sorted edges array';

  const edge1 = { posX: 1, posY: 1, radius: 1 };
  const edge2 = { posX: 2, posY: 2, radius: 2 };
  const edge3 = { posX: 3, posY: 3, radius: 3 };
  const nodes = [edge1, edge2, edge3];
  const result = calcAllEdgeWeights(nodes, 1);
  const weights = result.map(e => e[0]);
  const actual = weights[0] < weights[1] && weights[1] < weights[2];
  const expected = true;

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('`isSupported` should be false without global `document`', assert => {
  const msg = 'is based on `document` existance';

  const originalDocument = (typeof document === 'object' ? document : undefined);
  document = false;

  const actual = isSupported();
  const expected = false;
  assert.equal(actual, expected, msg);

  document = originalDocument;
  assert.end();
});

test('`isSupported` should be `false` when canvas cannot create a 2D context', assert => {
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

test('`isSupported` should be `true` when canvas creates a 2D context', assert => {
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

test('`getCanvasElement` should result in `error` when `HTMLElement` is not supported', assert => {
  const msg = 'results in error';

  const originalHTMLElement = (typeof HTMLElement === 'function' ? HTMLElement : undefined);
  const actual = getCanvasElement();
  const expected = actual instanceof Error;

  assert.ok(expected, msg);

  HTMLElement = originalHTMLElement;
  assert.end();
});

test('`getCanvasElement` should create specific `error` when `HTMLElement` is not supported', assert => {
  const msg = 'results in error';

  const originalHTMLElement = (typeof HTMLElement === 'function' ? HTMLElement : undefined);
  HTMLElement = undefined;
  const actual = getCanvasElement();
  const expected = actual instanceof Error;

  assert.ok(expected, msg);
  assert.equal(actual.message, 'HTMLElements not supported', msg);

  HTMLElement = originalHTMLElement;
  assert.end();
});

test('`getCanvasElement` should create correct `error` when given incorrect instance', assert => {
  const msg = 'results in error';

  const originalHTMLElement = (typeof HTMLElement === 'function' ? HTMLElement : undefined);
  HTMLElement = function TestConstructor () {};
  function IncorrectConstructor () {}

  const actual = getCanvasElement(new IncorrectConstructor());
  const expected = actual instanceof Error;

  assert.ok(expected, msg);
  assert.equal(actual.message, 'is not a canvas', msg);

  HTMLElement = originalHTMLElement;
  assert.end();
});

test('`getCanvasElement` should create correct `error` when element.nodeName incorrect', assert => {
  const msg = 'results in error';

  const originalHTMLElement = (typeof HTMLElement === 'function' ? HTMLElement : undefined);
  HTMLElement = function NotCanvasElement () {
    this.nodeName = 'NOTCANVAS';
  };

  const actual = getCanvasElement(new HTMLElement());
  const expected = actual instanceof Error;

  assert.ok(expected, msg);
  assert.equal(actual.message, 'is not a canvas', msg);

  HTMLElement = originalHTMLElement;
  assert.end();
});

test('`getCanvasElement` should successfully resolve an instance of a canvas element', assert => {
  const msg = 'resolves canvas element';

  const originalHTMLElement = (typeof HTMLElement === 'function' ? HTMLElement : undefined);
  HTMLElement = function CanvasElement () {
    this.nodeName = 'CANVAS';
  };

  const actual = new HTMLElement();
  const expected = getCanvasElement(actual);

  assert.equal(actual, expected, msg);

  HTMLElement = originalHTMLElement;
  assert.end();
});

test('`getCanvasElement` should successfully unpack a jQuery object wrapping a canvas', assert => {
  const msg = 'resolves canvas element';

  const originaljQuery = (typeof jQuery === 'function' ? jQuery : undefined);
  const originalHTMLElement = (typeof HTMLElement === 'function' ? HTMLElement : undefined);
  HTMLElement = function CanvasElement () {
    this.nodeName = 'CANVAS';
  };

  jQuery = function jQ (element) {
    this.get = () => element;
  };

  const actual = new HTMLElement();
  const expected = getCanvasElement.call({ jQuery }, new jQuery(actual));

  assert.equal(actual, expected, msg);

  jQuery = originaljQuery;
  HTMLElement = originalHTMLElement;
  assert.end();
});

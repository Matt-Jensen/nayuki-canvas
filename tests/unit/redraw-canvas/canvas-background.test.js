const { test } = require('tap');
const canvasBackground = require('../../../tmp/redraw-canvas/canvas-background');
const mockGraphics = require('../../helpers/mock-graphics');
const calcDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const { assign } = require('lodash');
const mockConf = {
  width: 100,
  height: 100,
  size: 100,
  graphics: mockGraphics(),
  startColor: '#fff',
  stopColor: '#fff',
  gradient: 'radial',
  background: ['#fff', '#f0f0f0']
};

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!canvasBackground;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'not updated';
  const actual = assign({}, mockConf); // copy
  const expected = assign({}, actual); // copy

  canvasBackground(actual);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'canvas backgrounds are the same';

  const config = assign({}, mockConf);
  const actual = canvasBackground(config);
  const expected = canvasBackground(config);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should create linear gradient relative to size of canvas', assert => {
  const msg = 'big canvas has larger background';
  const smaller = [];
  const larger = [];

  const stubbedGraphics = assign({
    createLinearGradient: (function () {
      let called = 0;
      return function (...demensions) {
        if (called === 0) {
          smaller.push(...demensions);
          called++;
        } else {
          larger.push(...demensions);
        }

        return { addColorStop () {} };
      };
    }())
  }, mockGraphics);

  const stubbedConf = assign({}, mockConf, { gradient: 'linear', graphics: stubbedGraphics });
  const smallConf = assign({}, stubbedConf);
  const largeConf = assign({}, stubbedConf, { width: 1000, height: 1000, size: 1000 });

  canvasBackground(smallConf);
  canvasBackground(largeConf);

  assert.ok(calcDistance(...smaller) < calcDistance(...larger), msg);
  assert.end();
});

test('should create radial gradient relative to size of canvas', assert => {
  const msg = 'big canvas has larger background';
  const smaller = [];
  const larger = [];

  const stubbedGraphics = assign({
    createRadialGradient: (function () {
      let called = 0;
      return function (...demensions) {
        if (called === 0) {
          smaller.push(...demensions);
          called++;
        } else {
          larger.push(...demensions);
        }

        return { addColorStop () {} };
      };
    }())
  }, mockGraphics);

  const stubbedConf = assign({}, mockConf, { graphics: stubbedGraphics });
  const smallConf = assign({}, stubbedConf);
  const largeConf = assign({}, stubbedConf, { width: 1000, height: 1000, size: 1000 });

  canvasBackground(smallConf);
  canvasBackground(largeConf);

  assert.ok(calcDistance(...smaller) < calcDistance(...larger), msg);
  assert.end();
});

test('should add color stop for each color in `background` array', assert => {
  const msg = 'all color stops were applied';
  const actual = [];
  const expected = ['#fff', '#111', '#333'];

  const stubbedGraphics = assign({
    createRadialGradient () {
      return {
        addColorStop (pos, color) {
          actual.push(color);
        }
      };
    }
  }, mockGraphics);

  const config = assign({}, mockConf, { background: expected, graphics: stubbedGraphics });

  canvasBackground(config);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should return a canvas gradient instance', assert => {
  const msg = 'is an instance of a canvas gradient';

  function TestGradient () {
    this.addColorStop = function () {};
  }

  const stubbedRadial = assign({
    createRadialGradient: function () {
      return new TestGradient();
    }
  }, mockGraphics);

  const stubbedLinear = assign({
    createLinearGradient: function () {
      return new TestGradient();
    }
  }, mockGraphics);

  const radialConf = assign({}, mockConf, { graphics: stubbedRadial });
  const linearConf = assign({}, mockConf, { gradient: 'linear', graphics: stubbedLinear });

  const radialGradient = canvasBackground(radialConf);
  const linearGradient = canvasBackground(linearConf);

  assert.ok(radialGradient instanceof TestGradient, msg);
  assert.ok(linearGradient instanceof TestGradient, msg);
  assert.end();
});

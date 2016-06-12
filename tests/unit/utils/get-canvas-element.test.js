const test = require('tape');
const getCanvasElement = require('../../../tmp/utils/get-canvas-element');

test('should exist', assert => {
  const msg = 'exports a module';
  const actual = !!getCanvasElement;
  const expected = true;
  assert.equal(actual, expected, msg);
  assert.end();
});

test('should be a pure function', assert => {
  const msg = 'are unchanged';

  const _HTMLElement = Function;
  const _jQuery = Function;
  const actual = [{ element: true }, _HTMLElement, _jQuery];
  const expected = [{ element: true }, _HTMLElement, _jQuery];

  getCanvasElement(...actual);

  assert.deepEqual(actual, expected, msg);
  assert.end();
});

test('should be idempotent', assert => {
  const msg = 'results are the same';

  const actual = getCanvasElement();
  const expected = getCanvasElement();

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `false` when element is not an instance of `HTMLElement`', assert => {
  const msg = 'returns false';

  const element = {};
  const _HTMLElement = Function;

  const actual = getCanvasElement(element, _HTMLElement);
  const expected = false;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should return `false` when valid element has non-canvas `nodeName`', assert => {
  const msg = 'returns false';

  const _HTMLElement = function ValidElement () {
    this.nodeName = 'invalidNodeName';
  };
  const element = new _HTMLElement();

  const actual = getCanvasElement(element, _HTMLElement);
  const expected = false;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should successfully resolve an instance of a valid canvas element', assert => {
  const msg = 'returns canvas instance';

  const _HTMLElement = function ValidElement () {
    this.nodeName = 'CANVAS'; // correct `nodeName`
  };
  const element = new _HTMLElement();

  const actual = getCanvasElement(element, _HTMLElement);
  const expected = element;

  assert.equal(actual, expected, msg);
  assert.end();
});

test('should resolve a valid canvas element wrapped in a jQuery object', assert => {
  const msg = 'returns canvas instance';

  const _jQuery = function MockjQuery (el) {
    this.get = function () {
      return el;
    };
  };
  const _HTMLElement = function ValidElement () {
    this.nodeName = 'CANVAS'; // correct `nodeName`
  };
  const element = new _HTMLElement();

  const actual = getCanvasElement(new _jQuery(element), _HTMLElement, _jQuery);
  const expected = element;

  assert.equal(actual, expected, msg);
  assert.end();
});

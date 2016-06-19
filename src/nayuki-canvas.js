// default configuration
import defaults from './defaults';

// prototype methods
import _updateNodes from './update-nodes';
import _updateEdges from './update-edges/index';
import _getNodeDeltas from './get-node-deltas/index';
import _redrawCanvas from './redraw-canvas/index';
import _getOpacity from './get-opacity';
import initialize from './initialize';
import next from './next';

// instance properties
import properties from './properties';

// utils
import getCanvasElement from './utils/get-canvas-element';
import isSupported from './utils/is-supported';

const prototype = {
  _updateNodes,
  _updateEdges,
  _getNodeDeltas,
  _redrawCanvas,
  _getOpacity,
  initialize,
  next
};

const isNodeEnv = (typeof window === 'undefined' && typeof global === 'object');

/**
 * Generates new Nayuki Canvas
 * @param  {Object} canvasElem DOM Canvas Element
 * @param  {Object} options    User configuration
 * @type   {Function}
 * @return {Object}            Nayuki Canvas
 */
function createCanvas (canvasElem = {}, options = {}) {
  if (isNodeEnv) {
    canvasElem = {};
  } else {
    canvasElem = getCanvasElement(canvasElem, HTMLElement, (window.jQuery || window.$));
  }

  if (!canvasElem) {

    // failed to resolve canvas element
    throw new Error('Nayuki Canvas: requires a Canvas element as it\'s first argument');
  }

  // overwrite config with user preferences
  const config = Object.assign({}, defaults, options);

  // create Nayuki Canvas instance
  const canvas = Object.create(prototype, properties);

  // apply configuration to canvas
  Object.assign(canvas, config);

  if (isSupported()) {
    canvas._graphics = canvasElem.getContext('2d'); // initialize canvas context
  } else {
    canvas._graphics = {}; // allow error free node testing
  }

  /**
   * Validated canvas element
   * @type {Object}
   */
  canvas._canvasElem = canvasElem;

  /**
   * Node properties
   * - posX: Horizontal position in relative coordinates, typically in the range [0.0, relWidth], where relWidth <= 1.0
   * - posY: Vertical position in relative coordinates, typically in the range [0.0, relHeight], where relHeight <= 1.0
   * - velX: Horizontal velocity in relative units (not pixels)
   * - velY: Vertical velocity in relative units (not pixels)
   * - radius: Radius of the node, a positive real number
   * - opacity: A number in the range [0.0, 1.0] representing the strength of the node
   */
  canvas._nodes = [];

  /**
   * Edge Properties
   * - nodeA: A reference to the node object representing one side of the undirected edge
   * - nodeB: A reference to the node object representing another side of the undirected edge (must be distinct from NodeA)
   * - opacity: A number in the range [0.0, 1.0] representing the strength of the edge
   */
  canvas._edges = [];

  /**
   * setup start and stop methods for canvas
   */
  (function () {
    let t;

    // allow stubbing (bind window to prevent illegal invokation in browser)
    canvas.setTimeout = setTimeout.bind(isNodeEnv ? global : window);
    canvas.clearTimeout = clearTimeout.bind(isNodeEnv ? global : window);

    /**
     * Begin reoccuring calls to `canvas.next`
     * @type   {Method}
     * @return {Object} canvas
     */
    canvas.start = function start (timer = NaN) {
      // only allow `start` calls if unstarted
      if (timer === t || t === undefined) {
        t = this.setTimeout(() => {
          this.next();
          this.start(t);
        }, this.frameInterval);
      }
      return this;
    };

    /**
     * Stops calls to `canvas.next`
     * @type   {Method}
     * @return {Object} canvas
     */
    canvas.stop = function stop () {
      t = this.clearTimeout(t);
      return this;
    };
  }());

  /**
   * destroing the canvas instance
   */
  canvas.destroy = function destroy () {
    this.stop(); // ensure `setTimeout` has stopped
    this._graphics.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
    this._graphics = this._canvasElem = this._nodes = this._edges = null; // clear up memory
    return this; // support chaining
  };

  // canvas instance
  return canvas;
}

/**
 * Add `nayukiCanvas` namespace properties
 */
createCanvas.isSupported = isSupported;

export default createCanvas;

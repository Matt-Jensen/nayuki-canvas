import defaults from './defaults';

import _updateNodes from './update-nodes';
import _updateEdges from './update-edges/index';
import getNodeDeltas from './get-node-deltas/index';
import _redrawCanvas from './redraw-canvas/index';
import _getOpacity from './get-opacity';
import initialize from './initialize';
import next from './next';

import properties from './properties';

import { getCanvasElement, isSupported } from './utils';

const prototype = {
  _updateNodes,
  _updateEdges,
  getNodeDeltas,
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
  canvasElem = getCanvasElement(canvasElem);

  if (isNodeEnv === true) {
    canvasElem = {}; // ignore error
  }

  if (canvasElem instanceof Error) {

    // failed to resolve canvas element
    canvasElem.message = `Nayuki Canvas: ${canvasElem.message}`;
    throw canvasElem;
  }

  // overwrite config with user preferences
  const config = Object.assign({}, defaults, options);

  // create Nayuki Canvas instance
  const canvas = Object.create(prototype, properties);

  // apply configuration to canvas
  Object.assign(canvas, config);

  if (isSupported()) {
    canvas.graphics = canvasElem.getContext('2d'); // initialize canvas context
  } else {
    canvas.graphics = {}; // allow error free node testing
  }

  /**
   * Validated canvas element
   * @type {Object}
   */
  canvas.canvasElem = canvasElem;

  /**
   * Node properties
   * - posX: Horizontal position in relative coordinates, typically in the range [0.0, relWidth], where relWidth <= 1.0
   * - posY: Vertical position in relative coordinates, typically in the range [0.0, relHeight], where relHeight <= 1.0
   * - velX: Horizontal velocity in relative units (not pixels)
   * - velY: Vertical velocity in relative units (not pixels)
   * - radius: Radius of the node, a positive real number
   * - opacity: A number in the range [0.0, 1.0] representing the strength of the node
   */
  canvas.nodes = [];

  /**
   * Edge Properties
   * - nodeA: A reference to the node object representing one side of the undirected edge
   * - nodeB: A reference to the node object representing another side of the undirected edge (must be distinct from NodeA)
   * - opacity: A number in the range [0.0, 1.0] representing the strength of the edge
   */
  canvas.edges = [];

  /**
   * setup start and stop methods for canvas
   */
  (function () {
    let t;

    // allow stubbing (bind window to prevent illegal invokation in browser)
    canvas.setInterval = setInterval.bind(isNodeEnv ? global : window);
    canvas.clearInterval = clearInterval.bind(isNodeEnv ? global : window);

    /**
     * Begin reoccuring calls to `canvas.next`
     * @type   {Method}
     * @return {Object} canvas
     */
    canvas.start = function start () {
      t = this.setInterval(() => this.next(), this.FRAME_INTERVAL);
      return this;
    };

    /**
     * Stops calls to `canvas.next`
     * @type   {Method}
     * @return {Object} canvas
     */
    canvas.stop = function stop () {
      this.clearInterval(t);
      return this;
    };
  }());

  // canvas instance
  return canvas;
}

/**
 * Add `nayukiCanvas` namespace properties
 */
createCanvas.isSupported = isSupported;

export default createCanvas;

import updateNodes from './update-nodes';
import updateEdges from './update-edges/index';
import getNodeDeltas from './get-node-deltas/index';
import redrawCanvas from './redraw-canvas/index';
import _getOpacity from './get-opacity';
import initialize from './initialize';
import next from './next';

import { getCanvasElement, isSupported } from './utils';

const prototype = {
  updateNodes,
  updateEdges,
  getNodeDeltas,
  redrawCanvas,
  _getOpacity,
  initialize,
  isSupported,
  next
};

const defaults = {
  extraEdges: 20,
  numNodes: 70,
  networkStyle: 'balanced',
  repulsion: 1,
  BORDER_FADE: -0.02,
  FADE_IN_RATE: 0.06,  // In the range (0.0, 1.0]
  FADE_OUT_RATE: 0.03,  // In the range (0.0, 1.0]
  FRAME_INTERVAL: 20  // In milliseconds
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

  const canvas = Object.create(prototype, {
    idealNumNodes: {
      get () {
        return parseInt(this.numNodes, 10);
      }
    },

    maxExtraEdges: {
      get () {
        const { extraEdges, numNodes } = this;
        return Math.round(parseFloat(extraEdges) / 100 * numNodes);
      }
    },

    radiiWeightPower: {
      get () {
        const { networkStyle } = this;

        let radiiWeightPower = 0.5; // balanced

        if (networkStyle === 'mesh') {
          radiiWeightPower = 0;
        } else if (networkStyle === 'hubAndSpoke') {
          radiiWeightPower = 1;
        }

        return parseFloat(radiiWeightPower);
      }
    },

    repulsionForce: {
      get () {
        const { repulsion } = this;
        if (!isNaN(repulsion)) {
          return repulsion * 0.000001;
        } else {
          return repulsion;
        }
      },

      set (value) {
        this.repulsion = parseFloat(value);
        return this.repulsion;
      }
    },

    // at least one of relWidth or relHeight is exactly 1
    // the aspect ratio relWidth:relHeight is equal to w:h
    relWidth: {
      get () {
        const { width, height } = this.canvasElem;
        return width / Math.max(width, height);
      }
    },

    relHeight: {
      get () {
        const { width, height } = this.canvasElem;
        return height / Math.max(width, height);
      }
    }
  });

  // apply configuration to canvas
  Object.assign(canvas, config);

  if (isSupported()) {

    // initialize canvas context
    canvas.graphics = canvasElem.getContext('2d');
  } else {
    canvas.graphics = {};
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

    /**
     * Begin reoccuring calls to `canvas.next`
     * @type   {Method}
     * @return {Object} canvas
     */
    canvas.start = function start () {
      t = setInterval(() => this.next(), this.FRAME_INTERVAL);
      return this;
    };

    /**
     * Stops calls to `canvas.next`
     * @type   {Method}
     * @return {Object} canvas
     */
    canvas.stop = function stop () {
      clearInterval(t);
      return this;
    };
  }());

  // canvas instance
  return canvas;
}

export default function (canvasElem, options) {
  return createCanvas(canvasElem, options);
}

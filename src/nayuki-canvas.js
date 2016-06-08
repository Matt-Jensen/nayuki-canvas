import updateNodes from './update-nodes';
import updateEdges from './update-edges/index';
import getNodeDeltas from './get-node-deltas/index';
import redrawCanvas from './redraw-canvas/index';
import _getOpacity from './get-opacity';
import initialize from './initialize';

const networkStyleKey = {
  mesh: 0,
  balanced: 0.5,
  hubAndSpoke: 1
};

const nayukiCanvas = {
  create (canvasElem, options) {

    if (canvasElem instanceof HTMLElement === false || canvasElem.nodeName !== 'CANVAS') {
      throw new Error('Nayuki Canvas requires a canvas element for the first argument');
    }

    // overwrite config with user options
    const config = Object.assign({
      extraEdges: 20,
      numNodes: 70,
      networkStyle: 'balanced',
      repulsion: 1,
      BORDER_FADE: -0.02,
      FADE_IN_RATE: 0.06,  // In the range (0.0, 1.0]
      FADE_OUT_RATE: 0.03,  // In the range (0.0, 1.0]
      FRAME_INTERVAL: 20  // In milliseconds
    }, options);

    const prototype = {
      updateNodes,
      updateEdges,
      getNodeDeltas,
      redrawCanvas,
      _getOpacity,
      initialize
    };

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
          const radiiWeightPower = networkStyleKey[networkStyle];
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

    canvas.canvasElem = canvasElem;

    // Initialize canvas and inputs
    canvas.graphics = canvasElem.getContext('2d');

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
     * WARNING all side effects on `nodes` & `edges` are done in this method!
     * Updates nodes, edges then draws new canvas frame
     * @type Method
     * @return Object     canvas instance
     */
    canvas.stepFrame = function stepFrame () {
      const {
        idealNumNodes,
        relWidth,
        relHeight,
        BORDER_FADE
      } = this;

      // Fade out nodes near the borders of the space or exceeding the target number of nodes
      const isNodeFadingOut = (node, index) => {
        return index >= idealNumNodes || node.posX < BORDER_FADE || relWidth - node.posX < BORDER_FADE || node.posY < BORDER_FADE || relHeight - node.posY < BORDER_FADE;
      };

      // update current node opacity
      this.nodes.map((node, index) => {
        const isFadingIn = !isNodeFadingOut(node, index);
        node.opacity = this._getOpacity(isFadingIn, node);
        return node;
      });

      this.nodes = this.updateNodes();

      const deltas = this.getNodeDeltas();

      // Apply "push" to nodes
      this.nodes.map(function (node, i) {
        node.posX += deltas[i * 2 + 0];
        node.posY += deltas[i * 2 + 1];
        return node;
      });

      this.edges = this.updateEdges();
      this.redrawCanvas();

      return this;
    };

    // Periodically execute stepFrame() to create animation
    setInterval(() => canvas.stepFrame(), config.FRAME_INTERVAL);

    // chart instance
    return canvas;
  }
};

export default nayukiCanvas;

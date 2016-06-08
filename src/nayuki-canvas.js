import updateNodes from './update-nodes/index';
import updateEdges from './update-edges/index';
import getNodeDeltas from './get-node-deltas/index';
import redrawCanvas from './redraw-canvas/index';
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
      speed: 1,
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

      driftSpeed: {
        get () {
          const { speed } = this;

          if (!isNaN(speed)) {
            return speed * 0.0001;
          } else {
            return speed;
          }
        },

        set (value) {
          this.speed = parseFloat(value);
          return this.speed;
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

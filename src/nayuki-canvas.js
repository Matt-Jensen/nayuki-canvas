import nayukiCore from './core/core';

const networkStyleKey = {
  mesh: 0,
  balanced: 0.5,
  hubAndSpoke: 1
};

const nayukiCanvas = {
  create (canvasElem, options) {

    if (canvasElem instanceof HTMLElement === false || canvasElem.nodeName !== 'CANVAS') {
      throw new Error('Nayuki Canvas requires a canvas DOM node as the first argument');
    }

    // Overwrite config with user options
    const config = Object.assign({
      extraEdges: 20,
      numNodes: 70,
      networkStyle: 'balanced',
      driftSpeed: 1,
      repulsionForce: 1,
      BORDER_FADE: -0.02,
      FADE_IN_RATE: 0.06,  // In the range (0.0, 1.0]
      FADE_OUT_RATE: 0.03,  // In the range (0.0, 1.0]
      FRAME_INTERVAL: 20  // In milliseconds
    }, options);
    const proto = Object.assign({}, { config }, nayukiCore);
    const canvas = Object.create(proto, {
      idealNumNodes: {
        get () {
          return parseInt(this.config.numNodes, 10);
        }
      },
      maxExtraEdges: {
        get () {
          const { extraEdges, numNodes } = this.config;
          return Math.round(parseFloat(extraEdges) / 100 * numNodes);
        }
      },
      radiiWeightPower: {
        get () {
          const { networkStyle } = this.config;
          const radiiWeightPower = networkStyleKey[networkStyle];
          return parseFloat(radiiWeightPower);
        }
      },
      driftSpeed: {
        get () {
          const driftSpeed = this.config.driftSpeed;
          if (!isNaN(driftSpeed)) {
            return driftSpeed * 0.0001;
          } else {
            return driftSpeed;
          }
        },
        set (value) {
          this.config.driftSpeed = parseFloat(value);
          return this.driftSpeed;
        }
      },
      repulsionForce: {
        get () {
          const repulsionForce = this.config.repulsionForce;
          if (!isNaN(repulsionForce)) {
            return repulsionForce * 0.000001;
          } else {
            return repulsionForce;
          }
        },
        set (value) {
          this.config.repulsionForce = parseFloat(value);
          return this.repulsionForce;
        }
      }
    });
    canvas.canvasElem = canvasElem;

    // Initialize canvas and inputs
    canvas.graphics = canvasElem.getContext('2d');

    // State of graph nodes - each object has these properties:
    // - posX: Horizontal position in relative coordinates, typically in the range [0.0, relWidth], where relWidth <= 1.0
    // - posY: Vertical position in relative coordinates, typically in the range [0.0, relHeight], where relHeight <= 1.0
    // - velX: Horizontal velocity in relative units (not pixels)
    // - velY: Vertical velocity in relative units (not pixels)
    // - radius: Radius of the node, a positive real number
    // - opacity: A number in the range [0.0, 1.0] representing the strength of the node
    canvas.nodes = [];

    // State of graph edges - each object has these properties:
    // - nodeA: A reference to the node object representing one side of the undirected edge
    // - nodeB: A reference to the node object representing another side of the undirected edge (must be distinct from NodeA)
    // - opacity: A number in the range [0.0, 1.0] representing the strength of the edge
    canvas.edges = [];

    // This important top-level function updates the arrays of nodes and edges, then redraws the canvas.
    // We define it within the closure to give it access to key variables that persist across iterations.
    canvas.stepFrame = function stepFrame () {
      this.nodes = this.updateNodes();
      this.edges = this.updateEdges();
      this.redrawCanvas();
    };

    // Periodically execute stepFrame() to create animation
    setInterval(() => canvas.stepFrame(), config.FRAME_INTERVAL);

    // chart instance
    return canvas;
  }
};

export default nayukiCanvas;

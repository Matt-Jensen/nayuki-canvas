import {
  calcAllEdgeWeights,
  calcSpanningTree,
  containsEdge,
  doForceField,
  updateEdges,
  redrawCanvas
} from './utils';

// TODO make options
var BORDER_FADE = -0.02;
var FADE_IN_RATE  = 0.06;  // In the range (0.0, 1.0]
var FADE_OUT_RATE = 0.03;  // In the range (0.0, 1.0]
var FRAME_INTERVAL = 20;  // In milliseconds

const networkStyleKey = {
  mesh: 0,
  balanced: 0.5,
  hubAndSpoke: 1
};

const nayukiCanvas = {
  create(canvasElem, options) {

    if (canvasElem instanceof HTMLElement === false || canvasElem.nodeName !== 'CANVAS') {
      throw new Error('Nayuki Canvas requires a canvas DOM node as the first argument');
    }

    // Overwrite config with user options
    const config = Object.assign({
      extraEdges: 20,
      numNodes: 70,
      networkStyle: 'balanced',
      driftSpeed: 1,
      repulsionForce: 1
    }, options);
    const proto = Object.assign({}, { config }, nayukiCanvas.core);
    const canvas = Object.create(proto, {
      idealNumNodes: {
        get() {
          return parseInt(this.config.numNodes, 10);
        }
      },
      maxExtraEdges: {
        get() {
          const { extraEdges, numNodes } = this.config;
          return Math.round(parseFloat(extraEdges) / 100 * numNodes);
        }
      },
      radiiWeightPower: {
        get() {
          const { networkStyle } = this.config;
          const radiiWeightPower = networkStyleKey[networkStyle];
          return parseFloat(radiiWeightPower);
        }
      },
      driftSpeed: {
        get() {
          const temp = this.config.driftSpeed;
          if (!isNaN(temp)) {
            return temp * 0.0001;
          }
        },
        set(value) {
          this.config.driftSpeed = parseFloat(value);
          return this.driftSpeed;
        }
      },
      repulsionForce: {
        get() {
          const temp = this.config.repulsionForce;
          if (!isNaN(temp)) {
            return temp * 0.000001;
          }
        },
        set(value) {
          this.config.repulsionForce = parseFloat(value);
          return this.repulsionForce;
        }
      }
    });
    canvas.el = canvasElem;

    // Initialize canvas and inputs
    const graphics = canvas.graphics = canvasElem.getContext('2d');

    // State of graph nodes - each object has these properties:
    // - posX: Horizontal position in relative coordinates, typically in the range [0.0, relWidth], where relWidth <= 1.0
    // - posY: Vertical position in relative coordinates, typically in the range [0.0, relHeight], where relHeight <= 1.0
    // - velX: Horizontal velocity in relative units (not pixels)
    // - velY: Vertical velocity in relative units (not pixels)
    // - radius: Radius of the node, a positive real number
    // - opacity: A number in the range [0.0, 1.0] representing the strength of the node
    let nodes = canvas.nodes = [];

    // State of graph edges - each object has these properties:
    // - nodeA: A reference to the node object representing one side of the undirected edge
    // - nodeB: A reference to the node object representing another side of the undirected edge (must be distinct from NodeA)
    // - opacity: A number in the range [0.0, 1.0] representing the strength of the edge
    let edges = canvas.edges = [];

    // This important top-level function updates the arrays of nodes and edges, then redraws the canvas.
    // We define it within the closure to give it access to key variables that persist across iterations.
    function stepFrame() {
      nodes = updateNodes(canvasElem.width, canvasElem.height, nodes);
      edges = updateEdges(nodes, edges);
      redrawCanvas(canvasElem, graphics, nodes, edges);
    }

    // Populate initial nodes and edges, then improve on them
    // stepFrame();  // Generate nodes
    // for (let i = 0; i < 300; i++) {  // Spread out nodes to avoid ugly clumping
    //   doForceField(nodes);
    // }
    // edges = [];
    // stepFrame();  // Redo spanning tree and extra edges because nodes have moved

    // Make everything render immediately instead of fading in
    // nodes.concat(edges).forEach(function(item) {  // Duck typing
    //   item.opacity = 1;
    // });
    // redrawCanvias(canvasElem, graphics, nodes, edges);

    // Periodically execute stepFrame() to create animation
    // setInterval(stepFrame, FRAME_INTERVAL);
    return canvas;
  },

  core: {
    updateNodes(pixWidth, pixHeight, nodes) {

      // At least one of relWidth or relHeight is exactly 1. The aspect ratio relWidth:relHeight is equal to w:h.
      var relWidth  = pixWidth  / Math.max(pixWidth, pixHeight);
      var relHeight = pixHeight / Math.max(pixWidth, pixHeight);

      // Update position, velocity, opacity; prune faded nodes
      var newNodes = [];
      nodes.forEach(function(node, index) {

        // Move based on velocity
        node.posX += node.velX * driftSpeed;
        node.posY += node.velY * driftSpeed;

        // Randomly perturb velocity, with damping
        node.velX = node.velX * 0.99 + (Math.random() - 0.5) * 0.3;
        node.velY = node.velY * 0.99 + (Math.random() - 0.5) * 0.3;

        if (index >= idealNumNodes || node.posX < BORDER_FADE || relWidth - node.posX < BORDER_FADE || node.posY < BORDER_FADE || relHeight - node.posY < BORDER_FADE) {

          // Fade out nodes near the borders of the space or exceeding the target number of nodes
          node.opacity = Math.max(node.opacity - FADE_OUT_RATE, 0);
        } else {

           // Fade in ones otherwise
          node.opacity = Math.min(node.opacity + FADE_IN_RATE, 1);
        }

        if (node.opacity > 0) {

          // Only keep visible nodes
          newNodes.push(node);
        }
      });

      // Add new nodes to fade in
      for (let i = newNodes.length; i < idealNumNodes; i++) {
        newNodes.push({ // Random position and radius, other properties initially zero
          posX: Math.random() * relWidth,
          posY: Math.random() * relHeight,
          radius: (Math.pow(Math.random(), 5) + 0.35) * 0.015,  // Skew toward smaller values
          velX: 0.0,
          velY: 0.0,
          opacity: 0.0,
        });
      }

      // Spread out nodes a bit
      doForceField(newNodes);
      return newNodes;
    }
  }
};

export default nayukiCanvas;

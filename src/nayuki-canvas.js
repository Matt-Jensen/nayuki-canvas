import {
  containsEdge,
  redrawCanvas
} from './utils'
import DisjointSet from './disjoint-set'

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
    canvas.canvasElem = canvasElem;

    // Initialize canvas and inputs
    const graphics = canvas.graphics = canvasElem.getContext('2d');

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

    // Periodically execute stepFrame() to create animation
    setTimeout(canvas.stepFrame.bind(canvas), FRAME_INTERVAL);
    return canvas;
  },

  core: {

    // This important top-level function updates the arrays of nodes and edges, then redraws the canvas.
    // We define it within the closure to give it access to key variables that persist across iterations.
    stepFrame() {
      const { canvasElem, graphics } = this;
      let { nodes, edges } = this;
      nodes = this.updateNodes(canvasElem.width, canvasElem.height, nodes);
      edges = this.updateEdges(nodes, edges);
      redrawCanvas(canvasElem, graphics, nodes, edges);
    },

    // Populate initial nodes and edges, then improve on them
    _initialize() {
      this.stepFrame();  // Generate nodes
      for (let i = 0; i < 300; i++) {  // Spread out nodes to avoid ugly clumping
        this.doForceField(nodes);
      }
      this.edges = [];
      this.stepFrame();  // Redo spanning tree and extra edges because nodes have moved

      // Make everything render immediately instead of fading in
      this.nodes.concat(this.edges).forEach(function(item) {  // Duck typing
        item.opacity = 1;
      });

      redrawCanvas(this.canvasElem, this.graphics, this.nodes, this.edges);
    },

    // Returns a new array of nodes by updating/adding/removing nodes based on the given array. Although the
    // argument array is not modified, the node objects themselves are modified. No other side effects.
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

        if (index >= this.idealNumNodes || node.posX < BORDER_FADE || relWidth - node.posX < BORDER_FADE || node.posY < BORDER_FADE || relHeight - node.posY < BORDER_FADE) {

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
      for (let i = newNodes.length; i < this.idealNumNodes; i++) {
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
      this.doForceField(newNodes);
      return newNodes;
    },

    // Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
    // based on the other given array. Although both argument arrays and nodes are unmodified,
    // the edge objects themselves are modified. No other side effects.
    updateEdges(nodes, edges) {
      let i = 0;

      // Calculate array of spanning tree edges, then add some extra low-weight edges
      let allEdges = this.calcAllEdgeWeights(nodes)
      const idealEdges = this.calcSpanningTree(allEdges, nodes);

      for (i = 0; i < allEdges.length && idealEdges.length < nodes.length - 1 + this.maxExtraEdges; i++) {
        const edge = { nodeA:nodes[allEdges[i][1]], nodeB:nodes[allEdges[i][2]] };  // Convert data formats
        if (!containsEdge(idealEdges, edge)) {
          idealEdges.push(edge);
        }
      }
      allEdges = null;  // Let this big array become garbage sooner

      // Classify each current edge, checking whether it is in the ideal set; prune faded edges
      const newEdges = [];
      edges.forEach(function(edge) {
        if (containsEdge(idealEdges, edge)) {
          edge.opacity = Math.min(edge.opacity + FADE_IN_RATE, 1);
        } else {
          edge.opacity = Math.max(edge.opacity - FADE_OUT_RATE, 0);
        }
        if (edge.opacity > 0 && edge.nodeA.opacity > 0 && edge.nodeB.opacity > 0) {
          newEdges.push(edge);
        }
      });

      // If there is room for new edges, add some missing spanning tree edges (higher priority), then extra edges
      for (i = 0; i < idealEdges.length && newEdges.length < nodes.length - 1 + this.maxExtraEdges; i++) {
        const edge = idealEdges[i];
        if (!containsEdge(newEdges, edge)) {
          edge.opacity = 0.0;  // Add missing property
          newEdges.push(edge);
        }
      }

      return newEdges;
    },

    // Updates the position of each node in the given array (in place), based on
    // their existing positions. Returns nothing. No other side effects.
    doForceField(nodes) {
      let i = 0;
      const deltas = [];

      for (i = 0; i < nodes.length * 2; i++) {
        deltas.push(0.0);
      }

      // For simplicitly, we perturb positions directly, instead of velocities
      for (i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        for (let j = 0; j < i; j++) {
          const nodeB = nodes[j];
          let dx = nodeA.posX - nodeB.posX;
          let dy = nodeA.posY - nodeB.posY;
          const distSqr = dx * dx + dy * dy;

          // Notes: The factor 1/sqrt(distSqr) is to make (dx, dy) into a unit vector.
          // 1/distSqr is the inverse square law, with a smoothing constant added to prevent singularity.
          const factor = this.repulsionForce / (Math.sqrt(distSqr) * (distSqr + 0.00001));
          dx *= factor;
          dy *= factor;
          deltas[i * 2 + 0] += dx;
          deltas[i * 2 + 1] += dy;
          deltas[j * 2 + 0] -= dx;
          deltas[j * 2 + 1] -= dy;
        }
      }

      for (i = 0; i < nodes.length; i++) {
        nodes[i].posX += deltas[i * 2 + 0];
        nodes[i].posY += deltas[i * 2 + 1];
      }
    },

    // Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
    calcAllEdgeWeights(nodes) {

      // Each entry has the form [weight, nodeAIndex, nodeBIndex], where nodeAIndex < nodeBIndex
      const result = [];

      for (let i = 0; i < nodes.length; i++) {  // Calculate all n * (n - 1) / 2 edges
        const nodeA = nodes[i];

        for (let j = 0; j < i; j++) {
          const nodeB = nodes[j];
          let weight = Math.hypot(nodeA.posX - nodeB.posX, nodeA.posY - nodeB.posY);  // Euclidean distance
          weight /= Math.pow(nodeA.radius * nodeB.radius, this.radiiWeightPower);  // Give discount based on node radii
          result.push([weight, i, j]);
        }
      }

      // Sort array by ascending weight
      result.sort((a, b) => {
        const [x] = a;
        const [y] = b;
        return x < y ? -1 : (x > y ? 1 : 0);
      });

      return result;
    },

    // Returns a new array of edge objects that is a minimal spanning tree on the given set
    // of nodes, with edges in ascending order of weight. Note that the returned edge objects
    // are missing the opacity property. Pure function, no side effects.
    calcSpanningTree(allEdges, nodes) {

      // Kruskal's MST algorithm
      const result = [];
      const ds = new DisjointSet(nodes.length);

      for (let i = 0; i < allEdges.length && result.length < nodes.length - 1; i++) {
        const edge = allEdges[i];
        const j = edge[1];
        const k = edge[2];

        if (ds.mergeSets(j, k)) {
          result.push({nodeA:nodes[j], nodeB:nodes[k]});
        }
      }

      return result;
    }
  }
};

export default nayukiCanvas;

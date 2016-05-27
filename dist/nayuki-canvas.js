(function () {
  'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  babelHelpers;

  function getNodeTrajectory(_ref, driftSpeed) {
    var posX = _ref.posX;
    var posY = _ref.posY;
    var velX = _ref.velX;
    var velY = _ref.velY;

    return {
      // Move based on velocity
      posX: posX + velX * driftSpeed,
      posY: posY + velY * driftSpeed,

      // Randomly perturb velocity, with damping
      velX: velX * 0.99 + (Math.random() - 0.5) * 0.3,
      velY: velY * 0.99 + (Math.random() - 0.5) * 0.3
    };
  }

  function getNodeOpacity(isFadingOut, opacity, FADE_IN_RATE, FADE_OUT_RATE) {
    if (isFadingOut) {
      return Math.max(opacity - FADE_OUT_RATE, 0);
    } else {
      // Fade in ones otherwise
      return Math.min(opacity + FADE_IN_RATE, 1);
    }
  }

  /*
  * Returns a new array of nodes by updating/adding/removing nodes based on the given array. Although the
  * argument array is not modified, the node objects themselves are modified. No other side effects.
  */
  function updateNodes() {
    var _canvasElem = this.canvasElem;
    var width = _canvasElem.width;
    var height = _canvasElem.height;
    var nodes = this.nodes;
    var idealNumNodes = this.idealNumNodes;
    var driftSpeed = this.driftSpeed;
    var _config = this.config;
    var FADE_IN_RATE = _config.FADE_IN_RATE;
    var FADE_OUT_RATE = _config.FADE_OUT_RATE;
    var BORDER_FADE = _config.BORDER_FADE;

    // At least one of relWidth or relHeight is exactly 1. The aspect ratio relWidth:relHeight is equal to w:h.

    var relWidth = width / Math.max(width, height);
    var relHeight = height / Math.max(width, height);

    // nodes to render
    var newNodes = [];

    // Fade out nodes near the borders of the space or exceeding the target number of nodes
    var isNodeFadingOut = function isNodeFadingOut(node, index) {
      return index >= idealNumNodes || node.posX < BORDER_FADE || relWidth - node.posX < BORDER_FADE || node.posY < BORDER_FADE || relHeight - node.posY < BORDER_FADE;
    };

    // Update position, velocity, opacity; prune faded nodes
    nodes.map(function (node, index) {

      // update node with new position & velocity
      Object.assign({}, node, getNodeTrajectory(node, driftSpeed));

      // update node opacity
      node.opacity = getNodeOpacity(isNodeFadingOut(node, index), node.opacity, FADE_IN_RATE, FADE_OUT_RATE);

      // Only keep visible nodes
      if (node.opacity > 0) {
        newNodes.push(node);
      }
    });

    // Add new nodes to fade in
    for (var i = newNodes.length; i < idealNumNodes; i++) {
      newNodes.push({ // Random position and radius, other properties initially zero
        posX: Math.random() * relWidth,
        posY: Math.random() * relHeight,
        radius: (Math.pow(Math.random(), 5) + 0.35) * 0.015, // Skew toward smaller values
        velX: 0.0,
        velY: 0.0,
        opacity: 0.0
      });
    }

    return newNodes;
  }

  var core = {
    getRepr: function getRepr(i) {
      if (this.parents[i] !== i) {
        this.parents[i] = this.getRepr(this.parents[i]);
      }
      return this.parents[i];
    },
    mergeSets: function mergeSets(i, j) {
      var repr0 = this.getRepr(i);
      var repr1 = this.getRepr(j);

      if (repr0 === repr1) {
        return false;
      }

      var cmp = this.ranks[repr0] - this.ranks[repr1];
      if (cmp >= 0) {
        if (cmp === 0) {
          this.ranks[repr0]++;
        }
        this.parents[repr1] = repr0;
      } else {
        this.parents[repr0] = repr1;
      }

      return true;
    }
  };

  // The union-find data structure. A heavily stripped-down version derived from https://www.nayuki.io/page/disjoint-set-data-structure .
  var disjointSet = {
    create: function create(size) {
      var instance = {
        parents: { value: [] },
        ranks: { value: [], writable: true }
      };

      for (var i = 0; i < size; i++) {
        instance.parents.value.push(i);
        instance.ranks.value.push(0);
      }

      return Object.create(core, instance);
    }
  };

  // Tests whether the given array of edge objects contains an edge with
  // the given endpoints (undirected). Pure function, no side effects.
  function containsEdge(array, edge) {
    for (var i = 0; i < array.length; i++) {
      var elem = array[i];
      var sameEdge = elem.nodeA === edge.nodeA && elem.nodeB === edge.nodeB;
      var symetricalEdge = elem.nodeA === edge.nodeB && elem.nodeB === edge.nodeA;

      if (sameEdge || symetricalEdge) {
        return true;
      }
    }
    return false;
  }

  // Returns a new array of edge objects that is a minimal spanning tree on the given set
  // of nodes, with edges in ascending order of weight. Note that the returned edge objects
  // are missing the opacity property. Pure function, no side effects.
  function calcSpanningTree(allEdges, nodes) {

    // Kruskal's MST algorithm
    var result = [];
    var ds = disjointSet.create(nodes.length);

    for (var i = 0; i < allEdges.length && result.length < nodes.length - 1; i++) {
      var edge = allEdges[i];

      var _edge = babelHelpers.slicedToArray(edge, 3);

      var j = _edge[1];
      var k = _edge[2];


      if (ds.mergeSets(j, k)) {
        result.push({ nodeA: nodes[j], nodeB: nodes[k] });
      }
    }

    return result;
  }

  // Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
  function calcAllEdgeWeights(nodes, radiiWeightPower) {

    // Each entry has the form [weight, nodeAIndex, nodeBIndex], where nodeAIndex < nodeBIndex
    var result = [];

    for (var i = 0; i < nodes.length; i++) {
      // Calculate all n * (n - 1) / 2 edges
      var nodeA = nodes[i];

      for (var j = 0; j < i; j++) {
        var nodeB = nodes[j];
        var weight = Math.hypot(nodeA.posX - nodeB.posX, nodeA.posY - nodeB.posY); // Euclidean distance
        weight /= Math.pow(nodeA.radius * nodeB.radius, radiiWeightPower); // Give discount based on node radii
        result.push([weight, i, j]);
      }
    }

    // Sort array by ascending weight
    return result.sort(function (_ref, _ref2) {
      var _ref4 = babelHelpers.slicedToArray(_ref, 1);

      var x = _ref4[0];

      var _ref3 = babelHelpers.slicedToArray(_ref2, 1);

      var y = _ref3[0];
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  function getEdgeOpacity(isFadingIn, edge, FADE_IN_RATE, FADE_OUT_RATE) {
    if (isFadingIn) {
      return Math.min(edge.opacity + FADE_IN_RATE, 1);
    } else {
      return Math.max(edge.opacity - FADE_OUT_RATE, 0);
    }
  }

  function isEdgeActive(edge) {
    return edge.opacity > 0 && edge.nodeA.opacity > 0 && edge.nodeB.opacity > 0;
  }

  function isTargetSmaller(target, goal) {
    var addLength = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    return function () {
      return target.length < goal.length - 1 + addLength;
    };
  }

  /*
  * Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
  * based on the other given array. Although both argument arrays and nodes are unmodified,
  * the edge objects themselves are modified. No other side effects.
  */
  function updateEdges() {
    var i = 0;
    var nodes = this.nodes;
    var edges = this.edges;
    var maxExtraEdges = this.maxExtraEdges;
    var radiiWeightPower = this.radiiWeightPower;
    var _config = this.config;
    var FADE_IN_RATE = _config.FADE_IN_RATE;
    var FADE_OUT_RATE = _config.FADE_OUT_RATE;


    var newEdges = [];

    // Calculate array of spanning tree edges
    // then add some extra low-weight edges
    var allEdges = calcAllEdgeWeights(nodes, radiiWeightPower);
    var idealEdges = calcSpanningTree(allEdges, nodes);

    var idealEdgesLimitReached = isTargetSmaller(idealEdges, nodes, maxExtraEdges);
    for (i = 0; i < allEdges.length && idealEdgesLimitReached(); i++) {
      var edge = {
        nodeA: nodes[allEdges[i][1]],
        nodeB: nodes[allEdges[i][2]]
      };

      if (!containsEdge(idealEdges, edge)) {
        idealEdges.push(edge);
      }
    }

    // Classify each current edge
    // Checking whether it is in the ideal set
    // Prune faded edges
    edges.map(function (edge) {
      var e = Object.assign({}, edge);

      e.opacity = getEdgeOpacity(containsEdge(idealEdges, e), e, FADE_IN_RATE, FADE_OUT_RATE);

      if (isEdgeActive(e)) {
        newEdges.push(e);
      }
    });

    // Add necessary new edges,
    // Add some missing spanning tree edges (higher priority), then extra edges
    var newEdgesLimitReached = isTargetSmaller(newEdges, nodes, maxExtraEdges);
    for (i = 0; i < idealEdges.length && newEdgesLimitReached(); i++) {
      var _edge = idealEdges[i];

      if (!containsEdge(newEdges, _edge)) {
        _edge.opacity = 0; // Add missing property
        newEdges.push(_edge); // Add rendered edges
      }
    }

    return newEdges;
  }

  /*
  * Updates the position of each node in the given array (in place), based on
  * their existing positions. Returns nothing. No other side effects.
  */
  function doForceField() {
    var i = 0;
    var deltas = [];
    var repulsionForce = this.repulsionForce;
    var nodes = this.nodes;


    for (i = 0; i < nodes.length * 2; i++) {
      deltas.push(0.0);
    }

    // For simplicitly, we perturb positions directly, instead of velocities
    for (i = 0; i < nodes.length; i++) {
      var nodeA = nodes[i];

      for (var j = 0; j < i; j++) {
        var nodeB = nodes[j];
        var dx = nodeA.posX - nodeB.posX;
        var dy = nodeA.posY - nodeB.posY;
        var distSqr = dx * dx + dy * dy;

        // Notes: The factor 1/sqrt(distSqr) is to make (dx, dy) into a unit vector.
        // 1/distSqr is the inverse square law, with a smoothing constant added to prevent singularity.
        var factor = repulsionForce / (Math.sqrt(distSqr) * (distSqr + 0.00001));
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
  }

  // Redraws the canvas based on the given values. No other side effects.
  function redrawCanvas() {
    var canvasElem = this.canvasElem;
    var graphics = this.graphics;
    var nodes = this.nodes;
    var edges = this.edges;

    // Get pixel dimensions

    var width = canvasElem.width;
    var height = canvasElem.height;

    var size = Math.max(width, height);

    // Draw background gradient to overwrite everything
    var gradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2);
    gradient.addColorStop(0.0, '#575E85');
    gradient.addColorStop(1.0, '#2E3145');
    graphics.fillStyle = gradient;
    graphics.fillRect(0, 0, width, height);

    // Draw every node
    nodes.forEach(function (node) {
      graphics.fillStyle = 'rgba(129,139,197,' + node.opacity.toFixed(3) + ')';
      graphics.beginPath();
      graphics.arc(node.posX * size, node.posY * size, node.radius * size, 0, Math.PI * 2);
      graphics.fill();
    });

    // Draw every edge
    graphics.lineWidth = size / 800;
    edges.forEach(function (edge) {
      var nodeA = edge.nodeA;
      var nodeB = edge.nodeB;

      var dx = nodeA.posX - nodeB.posX;
      var dy = nodeA.posY - nodeB.posY;
      var mag = Math.hypot(dx, dy);

      if (mag > nodeA.radius + nodeB.radius) {
        // Draw edge only if circles don't intersect
        dx /= mag; // Make (dx, dy) a unit vector, pointing from B to A
        dy /= mag;

        var opacity = Math.min(Math.min(nodeA.opacity, nodeB.opacity), edge.opacity);
        graphics.strokeStyle = 'rgba(129,139,197,' + opacity.toFixed(3) + ')';
        graphics.beginPath();

        // Shorten the edge so that it only touches the circumference of each circle
        graphics.moveTo((nodeA.posX - dx * nodeA.radius) * size, (nodeA.posY - dy * nodeA.radius) * size);
        graphics.lineTo((nodeB.posX + dx * nodeB.radius) * size, (nodeB.posY + dy * nodeB.radius) * size);

        // add to canvas
        graphics.stroke();
      }
    });
  }

  // Populate initial nodes and edges, then improve on them
  function initialize() {
    this.stepFrame(); // Generate nodes

    for (var i = 0; i < 300; i++) {
      // Spread out nodes to avoid ugly clumping
      this.doForceField();
    }

    this.edges = [];
    this.stepFrame(); // Redo spanning tree and extra edges because nodes have moved

    // Make everything render immediately instead of fading in
    this.nodes.concat(this.edges).forEach(function (item) {
      // Duck typing
      item.opacity = 1;
    });

    this.redrawCanvas();
  }

  var nayukiCore = {
    updateNodes: updateNodes,
    updateEdges: updateEdges,
    doForceField: doForceField,
    redrawCanvas: redrawCanvas,
    initialize: initialize
  };

  var networkStyleKey = {
    mesh: 0,
    balanced: 0.5,
    hubAndSpoke: 1
  };

  var nayukiCanvas = {
    create: function create(canvasElem, options) {

      if (canvasElem instanceof HTMLElement === false || canvasElem.nodeName !== 'CANVAS') {
        throw new Error('Nayuki Canvas requires a canvas DOM node as the first argument');
      }

      // Overwrite config with user options
      var config = Object.assign({
        extraEdges: 20,
        numNodes: 70,
        networkStyle: 'balanced',
        driftSpeed: 1,
        repulsionForce: 1,
        BORDER_FADE: -0.02,
        FADE_IN_RATE: 0.06, // In the range (0.0, 1.0]
        FADE_OUT_RATE: 0.03, // In the range (0.0, 1.0]
        FRAME_INTERVAL: 20 // In milliseconds
      }, options);
      var proto = Object.assign({}, { config: config }, nayukiCore);
      var canvas = Object.create(proto, {
        idealNumNodes: {
          get: function get() {
            return parseInt(this.config.numNodes, 10);
          }
        },
        maxExtraEdges: {
          get: function get() {
            var _config = this.config;
            var extraEdges = _config.extraEdges;
            var numNodes = _config.numNodes;

            return Math.round(parseFloat(extraEdges) / 100 * numNodes);
          }
        },
        radiiWeightPower: {
          get: function get() {
            var networkStyle = this.config.networkStyle;

            var radiiWeightPower = networkStyleKey[networkStyle];
            return parseFloat(radiiWeightPower);
          }
        },
        driftSpeed: {
          get: function get() {
            var driftSpeed = this.config.driftSpeed;
            if (!isNaN(driftSpeed)) {
              return driftSpeed * 0.0001;
            } else {
              return driftSpeed;
            }
          },
          set: function set(value) {
            this.config.driftSpeed = parseFloat(value);
            return this.driftSpeed;
          }
        },
        repulsionForce: {
          get: function get() {
            var repulsionForce = this.config.repulsionForce;
            if (!isNaN(repulsionForce)) {
              return repulsionForce * 0.000001;
            } else {
              return repulsionForce;
            }
          },
          set: function set(value) {
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
      canvas.stepFrame = function stepFrame() {
        this.nodes = this.updateNodes();
        this.edges = this.updateEdges();

        // Spread out nodes a bit
        this.doForceField();

        this.redrawCanvas();
      };

      // Periodically execute stepFrame() to create animation
      setInterval(function () {
        return canvas.stepFrame();
      }, config.FRAME_INTERVAL);

      // chart instance
      return canvas;
    }
  };

  if ((typeof exports === 'undefined' ? 'undefined' : babelHelpers.typeof(exports)) === 'object') {
    module.exports = nayukiCanvas;
  } else if (typeof define === 'function' && typeof define.amd !== 'undefined') {
    define(function () {
      return nayukiCanvas;
    });
  } else if (window && !window.nayukiCanvas) {
    window.nayukiCanvas = nayukiCanvas;
  }

}());
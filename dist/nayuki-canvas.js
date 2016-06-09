(function () {
  'use strict';

  /**
  * Returns an array of updated nodes
  * Updates/adds/removes current nodes based on the given array
  * @type {Method}
  * @return {Array} Nodes
  */
  function updateNodes() {
    var nodes = this.nodes;
    var idealNumNodes = this.idealNumNodes;
    var relWidth = this.relWidth;
    var relHeight = this.relHeight;

    // nodes to render

    var newNodes = [];

    // Only keep visible nodes
    nodes.map(function (node) {
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
        velX: 0,
        velY: 0,
        opacity: 0
      });
    }

    return newNodes;
  }

  var prototype = {
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

  /**
   * The union-find data structure.
   * A lite version of https://www.nayuki.io/page/disjoint-set-data-structure
   * @param  {Number} size
   * @return {Object}
   */
  function disjointSet(size) {
    var instance = {
      parents: { value: [] },
      ranks: { value: [], writable: true }
    };

    for (var i = 0; i < size; i++) {
      instance.parents.value.push(i);
      instance.ranks.value.push(0);
    }

    return Object.create(prototype, instance);
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var slicedToArray = function () {
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

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /**
   * Tests whether the given array of edge objects contains an edge with
   * the given endpoints (undirected). Pure function, no side effects.
   *
   * @type Function
   * @return Boolean
   */
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

  /**
   * Returns a new array of edge objects that is a minimal spanning tree on the given set
   * of nodes, with edges in ascending order of weight. Note that the returned edge objects
   * are missing the opacity property. Pure function, no side effects.
   *
   * @type Function
   * @return Array
   */
  function calcSpanningTree(allEdges, nodes) {

    // Kruskal's MST algorithm
    var result = [];
    var ds = disjointSet(nodes.length);

    for (var i = 0; i < allEdges.length && result.length < nodes.length - 1; i++) {
      var edge = allEdges[i];

      var _edge = slicedToArray(edge, 3);

      var j = _edge[1];
      var k = _edge[2];


      if (ds.mergeSets(j, k)) {
        result.push({ nodeA: nodes[j], nodeB: nodes[k] });
      }
    }

    return result;
  }

  /**
   * Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
   *
   * @type Function
   * @return Array
   */
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
      var _ref4 = slicedToArray(_ref, 1);

      var x = _ref4[0];

      var _ref3 = slicedToArray(_ref2, 1);

      var y = _ref3[0];
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  /**
   * Create a deep copy of a given collection
   * @type Function
   */
  function deepCopy(c) {
    return JSON.parse(JSON.stringify(c));
  }

  /**
   * Determines if an edge is active based on opacity of itself and connected nodes
   * @param {Object}  edge
   * @type {Function}
   * @return {Boolean}
   */
  function isEdgeActive(edge) {
    return edge.opacity > 0 && edge.nodeA.opacity > 0 && edge.nodeB.opacity > 0;
  }

  /**
   * Compares a target's array length to another array length
   * @param {Array}   target
   * @param {Array}   goal
   * @param {Number}  addLength
   * @type {Function}
   * @return {Boolean}
   */
  function isTargetSmaller(target, goal) {
    var addLength = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    return function () {
      return target.length < goal.length - 1 + addLength;
    };
  }

  /**
  * Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
  * based on the other given array. Although both argument arrays and nodes are unmodified,
  * the edge objects themselves are modified. No other side effects.
  * @type {Method}
  * @return {Array}
  */
  function updateEdges() {
    var _this = this;

    var nodes = this.nodes;
    var edges = this.edges;
    var maxExtraEdges = this.maxExtraEdges;
    var radiiWeightPower = this.radiiWeightPower;


    var newEdges = [];

    // calculate array of spanning tree edges
    var allEdges = calcAllEdgeWeights(nodes, radiiWeightPower);
    var idealEdges = calcSpanningTree(allEdges, nodes);
    var idealEdgesLimitReached = isTargetSmaller(idealEdges, nodes, maxExtraEdges);

    // add some extra low-weight edges to `idealEdges`
    for (var i = 0; i < allEdges.length && idealEdgesLimitReached(); i++) {
      var edge = {
        nodeA: nodes[allEdges[i][1]],
        nodeB: nodes[allEdges[i][2]]
      };

      if (!containsEdge(idealEdges, edge)) {
        idealEdges.push(edge);
      }
    }

    // update existing egdge opacity and prune faded edges
    edges.map(function (edge) {
      var e = Object.assign({}, edge);
      var isFadingIn = containsEdge(idealEdges, e);

      e.opacity = _this._getOpacity(isFadingIn, e);

      if (isEdgeActive(e)) {
        newEdges.push(e);
      }
    });

    var newEdgesLimitReached = isTargetSmaller(newEdges, nodes, maxExtraEdges);

    // add new, missing spanning tree edges (high priority), and extra edges
    for (var j = 0; j < idealEdges.length && newEdgesLimitReached(); j++) {
      var _edge = idealEdges[j];

      if (!containsEdge(newEdges, _edge)) {
        _edge.opacity = 0; // add missing property
        newEdges.push(_edge); // add rendered edges
      }
    }

    return newEdges;
  }

  /**
   * Factory that produces grouping of caclulations based on a pair of nodes
   * @type {Function}
   */
  function nodePair(node1, node2, rf) {
    return Object.create(null, {
      nodeA: { value: node1 },
      nodeB: { value: node2 },
      repulsionForce: { value: rf },

      x: {
        get: function get() {
          var nodeA = this.nodeA;
          var nodeB = this.nodeB;

          return nodeA.posX - nodeB.posX;
        }
      },

      y: {
        get: function get() {
          var nodeA = this.nodeA;
          var nodeB = this.nodeB;

          return nodeA.posY - nodeB.posY;
        }
      },

      distSqr: {
        get: function get() {
          var x = this.x;
          var y = this.y;

          return x * x + y * y;
        }
      },

      /**
       * 1/sqrt(distSqr) make (x, y) into a unit vector
       * 1/distSqr is the inverse square law, with a smoothing constant added to prevent singularity.
       * @return {Number}
       */
      factor: {
        get: function get() {
          var distSqr = this.distSqr;
          var repulsionForce = this.repulsionForce;

          return repulsionForce / (Math.sqrt(distSqr) * (distSqr + 0.00001));
        }
      },

      deltas: {
        get: function get() {
          var x = this.x;
          var y = this.y;
          var factor = this.factor;

          return {
            dx: x * factor,
            dy: y * factor
          };
        }
      }
    });
  }

  /**
   * Create array of deltas based on list of nodes
   * @param  {Array} nodes
   * @param  {Number} repulsionForce
   * @return {Array}
   */
  function getNodeDeltas() {
    var nodes = arguments.length <= 0 || arguments[0] === undefined ? this.nodes : arguments[0];
    var repulsionForce = arguments.length <= 1 || arguments[1] === undefined ? this.repulsionForce : arguments[1];

    var deltas = [];
    var nodesCp = deepCopy(nodes);

    for (var i = 0; i < nodesCp.length * 2; i++) {
      deltas.push(0);
    }

    // For simplicitly, we perturb positions directly, instead of velocities
    nodesCp.forEach(function (nodeA, k) {
      for (var j = 0; j < k; j++) {
        var np = nodePair(nodeA, nodesCp[j], repulsionForce);
        var _np$deltas = np.deltas;
        var dx = _np$deltas.dx;
        var dy = _np$deltas.dy;

        deltas[k * 2 + 0] += dx;
        deltas[k * 2 + 1] += dy;
        deltas[j * 2 + 0] -= dx;
        deltas[j * 2 + 1] -= dy;
      }
    });

    return deltas;
  }

  /**
   * Factory that generates a Canvas Background instance
   * @type {Function}
   * @return {Object} (Canvas Background)
   */
  function canvasBackground(config) {
    var defaults = {
      startColor: '#575E85', // TODO make gradient start color configurable
      stopColor: '#2E3145' // TODO make gradient end color configurable
      //, background: '' // TODO allow single color backgrounds
    };

    return Object.assign(Object.create(null, {
      gradient: {
        get: function get() {
          var width = this.width;
          var height = this.height;
          var size = this.size;
          var graphics = this.graphics;
          var startColor = this.startColor;
          var stopColor = this.stopColor;

          var gradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2);
          gradient.addColorStop(0, startColor);
          gradient.addColorStop(1, stopColor);
          return gradient;
        }
      }
    }), defaults, config);
  }

  function isEdgeVisible(edge, mag) {
    // Do edge's nodes overlap
    return mag > edge.nodeA.radius + edge.nodeB.radius;
  }

  /**
   * Generates a Canvas Frame instances
   * @type {Function}
   * @return {Object} (Canvas Frame)
   */
  function canvasFrame(config) {
    var defaults = {
      // get frame dimensions
      width: config.canvasElem.width,
      height: config.canvasElem.height,
      size: Math.max(config.canvasElem.width, config.canvasElem.height)
    };

    var instance = Object.create({ isEdgeVisible: isEdgeVisible }, {
      background: {
        get: function get() {
          return canvasBackground(this.data).gradient; // TODO make gradient type configurable
        }
      },

      nodes: {
        get: function get() {
          var size = this.data.size;

          var color = '129,139,197'; // TODO make node color configurable

          return this.data.nodes.map(function (node) {
            return {
              fill: 'rgba(' + color + ',' + node.opacity.toFixed(3) + ')',
              arc: [node.posX * size, node.posY * size, node.radius * size, 0, Math.PI * 2]
            };
          });
        }
      },

      edges: {
        get: function get() {
          var _this = this;

          var size = this.data.size;

          var color = '129,139,197'; // TODO make edge color configurable

          return this.data.edges.map(function (edge) {
            var nodeA = edge.nodeA;
            var nodeB = edge.nodeB;


            var dx = nodeA.posX - nodeB.posX;
            var dy = nodeA.posY - nodeB.posY;

            var opacity = Math.min(Math.min(nodeA.opacity, nodeB.opacity), edge.opacity);
            var mag = Math.hypot(dx, dy);

            dx /= mag; // make dx a unit vector, pointing from B to A
            dy /= mag; // make dy a unit vector, pointing from B to A

            if (_this.isEdgeVisible(edge, mag) === false) {
              return false; // don't render
            }

            return {
              style: 'rgba(' + color + ',' + opacity.toFixed(3) + ')',

              // Shorten edge so it only touches the circumference of node
              start: [(nodeA.posX - dx * nodeA.radius) * size, (nodeA.posY - dy * nodeA.radius) * size],
              end: [(nodeB.posX + dx * nodeB.radius) * size, (nodeB.posY + dy * nodeB.radius) * size]
            };
          }).filter(function (e) {
            return e;
          }); // remove invisible edges
        }
      }
    });

    return Object.assign(instance, { data: Object.assign(defaults, config) });
  }

  /**
   * Creates a new frame and renders it to the canvas
   * @type {Method}
   * @return {Frame} (generated frame instance)
   */
  function redrawCanvas() {
    var canvasElem = this.canvasElem;
    var graphics = this.graphics;
    var nodes = this.nodes;
    var edges = this.edges;

    var frame = canvasFrame({ canvasElem: canvasElem, graphics: graphics, nodes: nodes, edges: edges });

    // Set background first (render below nodes & edges)
    graphics.fillStyle = frame.background;
    graphics.fillRect(0, 0, frame.data.width, frame.data.height);

    // Draw nodes (render below edges)
    frame.nodes.forEach(function (node) {
      graphics.fillStyle = node.fill;
      graphics.beginPath();
      graphics.arc.apply(graphics, toConsumableArray(node.arc));
      graphics.fill();
    });

    graphics.lineWidth = frame.data.size / 800; // TODO make edge width configurable

    // Draw edges (render on top)
    frame.edges.forEach(function (e) {
      graphics.strokeStyle = e.style;
      graphics.beginPath();

      graphics.moveTo.apply(graphics, toConsumableArray(e.start));
      graphics.lineTo.apply(graphics, toConsumableArray(e.end));

      graphics.stroke(); // add to canvas
    });

    return frame;
  }

  /**
   * Determines input opacity
   * @param {Boolean} isFadingIn
   * @param {Object}  input
   * @param {Number} FADE_IN_RATE
   * @param {Number} FADE_OUT_RATE
   * @type {Method}
   * @return {Number}
   */
  function getOpacity(isFadingIn, input) {
    var FADE_IN_RATE = arguments.length <= 2 || arguments[2] === undefined ? this.FADE_IN_RATE : arguments[2];
    var FADE_OUT_RATE = arguments.length <= 3 || arguments[3] === undefined ? this.FADE_OUT_RATE : arguments[3];

    if (isFadingIn) {
      return Math.min(input.opacity + FADE_IN_RATE, 1);
    } else {
      return Math.max(input.opacity - FADE_OUT_RATE, 0);
    }
  }

  function initialize() {

    // Spread out nodes to avoid ugly clumping
    for (var i = 0; i < 70; i++) {
      this.next();
    }
  }

  /**
   * WARNING all side effects to canvas state (nodes/edges) are done in this method!
   * Updates nodes, edges then draws new canvas frame
   * @type {Method}
   * @return {Object}  canvas instance
   */
  function next() {
    var idealNumNodes = arguments.length <= 0 || arguments[0] === undefined ? this.idealNumNodes : arguments[0];
    var relWidth = arguments.length <= 1 || arguments[1] === undefined ? this.relWidth : arguments[1];

    var _this = this;

    var relHeight = arguments.length <= 2 || arguments[2] === undefined ? this.relHeight : arguments[2];
    var BORDER_FADE = arguments.length <= 3 || arguments[3] === undefined ? this.BORDER_FADE : arguments[3];


    // fade out nodes near the borders of the space or exceeding the target number of nodes
    var isNodeFadingOut = function isNodeFadingOut(_ref) {
      var posX = _ref.posX;
      var posY = _ref.posY;

      return posX < BORDER_FADE || relWidth - posX < BORDER_FADE || posY < BORDER_FADE || relHeight - posY < BORDER_FADE;
    };

    /*
    * important to only update existing node objects here
    * and ensure that node instances are preserved
    * which edges must to refer to via `updateEdges`.
    */

    // update current nodes' opacity
    this.nodes.map(function (node, index) {
      var isFadingIn = !(index >= idealNumNodes || isNodeFadingOut(node));
      node.opacity = _this._getOpacity(isFadingIn, node);
      return node;
    });

    this.nodes = this.updateNodes(); // create new nodes and drop old

    /*
     * update nodes' trajectory
     */
    var deltas = this.getNodeDeltas();

    // apply "push" to nodes
    this.nodes.map(function (node, i) {
      node.posX += deltas[i * 2 + 0];
      node.posY += deltas[i * 2 + 1];
      return node;
    });

    /*
     * update edges' trajectory and opacity
     */
    this.edges = this.updateEdges(); // create new edges, update/drop existing

    /*
     * draw state to canvas
     */
    this.redrawCanvas();

    return this; // allow chaining
  }

  var networkStyleKey = {
    mesh: 0,
    balanced: 0.5,
    hubAndSpoke: 1
  };

  function createCanvas(canvasElem, options) {
    if (canvasElem instanceof HTMLElement === false || canvasElem.nodeName !== 'CANVAS') {
      throw new Error('Nayuki Canvas requires a canvas element for the first argument');
    }

    // overwrite config with user options
    var config = Object.assign({
      extraEdges: 20,
      numNodes: 70,
      networkStyle: 'balanced',
      repulsion: 1,
      BORDER_FADE: -0.02,
      FADE_IN_RATE: 0.06, // In the range (0.0, 1.0]
      FADE_OUT_RATE: 0.03, // In the range (0.0, 1.0]
      FRAME_INTERVAL: 20 // In milliseconds
    }, options);

    var prototype = {
      updateNodes: updateNodes,
      updateEdges: updateEdges,
      getNodeDeltas: getNodeDeltas,
      redrawCanvas: redrawCanvas,
      _getOpacity: getOpacity,
      initialize: initialize,
      next: next
    };

    var canvas = Object.create(prototype, {
      idealNumNodes: {
        get: function get() {
          return parseInt(this.numNodes, 10);
        }
      },

      maxExtraEdges: {
        get: function get() {
          var extraEdges = this.extraEdges;
          var numNodes = this.numNodes;

          return Math.round(parseFloat(extraEdges) / 100 * numNodes);
        }
      },

      radiiWeightPower: {
        get: function get() {
          var networkStyle = this.networkStyle;

          var radiiWeightPower = networkStyleKey[networkStyle];
          return parseFloat(radiiWeightPower);
        }
      },

      repulsionForce: {
        get: function get() {
          var repulsion = this.repulsion;

          if (!isNaN(repulsion)) {
            return repulsion * 0.000001;
          } else {
            return repulsion;
          }
        },
        set: function set(value) {
          this.repulsion = parseFloat(value);
          return this.repulsion;
        }
      },

      // at least one of relWidth or relHeight is exactly 1
      // the aspect ratio relWidth:relHeight is equal to w:h
      relWidth: {
        get: function get() {
          var _canvasElem = this.canvasElem;
          var width = _canvasElem.width;
          var height = _canvasElem.height;

          return width / Math.max(width, height);
        }
      },

      relHeight: {
        get: function get() {
          var _canvasElem2 = this.canvasElem;
          var width = _canvasElem2.width;
          var height = _canvasElem2.height;

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
     * setup start and stop methods for canvas
     */
    ;(function () {
      var t = void 0;

      /**
       * Begin reoccuring calls to `canvas.next`
       * @type {Method}
       * @return {Object} canvas
       */
      canvas.start = function start() {
        var _this = this;

        t = setInterval(function () {
          return _this.next();
        }, this.FRAME_INTERVAL);
        return this;
      };

      /**
       * Stops calls to `canvas.next`
       * @type {Method}
       * @return {Object} canvas
       */
      canvas.stop = function () {
        clearInterval(t);
        return this;
      };
    })();

    // chart instance
    return canvas;
  }

  function nayukiCanvas (canvasElem, options) {
    return createCanvas(canvasElem, options);
  }

  if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
    module.exports = nayukiCanvas;
  } else if (typeof define === 'function' && typeof define.amd !== 'undefined') {
    define(function () {
      return nayukiCanvas;
    });
  } else if (window && !window.nayukiCanvas) {
    window.nayukiCanvas = nayukiCanvas;
  }

}());
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.nayukiCanvas = factory());
}(this, function () { 'use strict';

  var defaults = {
    extraEdges: 20,
    nodeCount: 70,
    network: 'balanced',
    repulsion: 1,
    borderFade: -0.02,
    fadeInRate: 0.06,
    fadeOutRate: 0.03,
    frameInterval: 20,
    background: ['#0275d8', '#055396'],
    gradient: 'radial',
    nodeColor: '#f1f1f1',
    edgeColor: '#b4b4b4',
    edgeSize: 0.7,
    nodeSize: 900
  };

  /**
  * Returns an array of updated nodes
  * Updates/adds/removes current nodes based on the given array
  * @param {Array}    nodes
  * @param {Number}   idealnodeCount
  * @param {Number}   relWidth
  * @param {Number}   relHeight
  * @type {Method}
  * @private
  * @return {Array}  Nodes
  */
  function updateNodes() {
    var nodes = arguments.length <= 0 || arguments[0] === undefined ? this._nodes : arguments[0];
    var idealnodeCount = arguments.length <= 1 || arguments[1] === undefined ? this._idealnodeCount : arguments[1];
    var relWidth = arguments.length <= 2 || arguments[2] === undefined ? this._relWidth : arguments[2];
    var relHeight = arguments.length <= 3 || arguments[3] === undefined ? this._relHeight : arguments[3];

    var newNodes = []; // nodes to render

    // Only keep visible nodes
    nodes.map(function (node) {
      if (node.opacity > 0) {
        newNodes.push(node);
      }
    });

    // Add new nodes to fade in
    for (var i = newNodes.length; i < idealnodeCount; i++) {
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
   * Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
   * @param {Array}     nodes
   * @param {Number}    radiiWeightPower
   * @type {Function}
   * @return {Array}    [[weight, index1, index2]]
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

  var prototype$1 = {
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
   * @type   {Function}
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

    return Object.create(prototype$1, instance);
  }

  /**
   * Returns a new array of edge objects that is a minimal spanning tree on the given set
   * of nodes, with edges in ascending order of weight. Note that the returned edge objects
   * are missing the opacity property. Pure function, no side effects.
   * @param {Array}    allEdges
   * @param {Array}    nodes
   * @type {Function}
   * @return {Array}
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
   * Tests whether the given array of edge objects contains an edge with
   * the given endpoints (undirected). Pure function, no side effects.
   * @param {Array}    allEdges
   * @param {Object}   edge
   * @type {Function}
   * @return {Boolean}
   */
  function containsEdge(allEdges, edge) {
    for (var i = 0; i < allEdges.length; i++) {
      var elem = allEdges[i];
      var sameEdge = elem.nodeA === edge.nodeA && elem.nodeB === edge.nodeB;
      var symetricalEdge = elem.nodeA === edge.nodeB && elem.nodeB === edge.nodeA;

      if (sameEdge || symetricalEdge) {
        return true;
      }
    }
    return false;
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

  function isObject(target) {
    return (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target instanceof Array === false;
  }

  // polyfill based on: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  function objectAssign(target) {
    if (typeof Object.assign === 'function') {
      return Object.assign.apply(Object, arguments);
    }

    if (!isObject(target)) {
      throw new Error('Cannot perform assign on non-object');
    }

    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];

      if (isObject(source)) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }

    return target;
  }

  /**
  * Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
  * based on the other given array. Although both argument arrays and nodes are unmodified,
  * the edge objects themselves are modified. No other side effects.
  * @param {Array}    nodes
  * @param {Array}    edges
  * @param {Number}   maxExtraEdges
  * @param {Number}   radiiWeightPower
  * @type {Method}
  * @private
  * @return {Array}
  */
  function updateEdges() {
    var nodes = arguments.length <= 0 || arguments[0] === undefined ? this._nodes : arguments[0];
    var edges = arguments.length <= 1 || arguments[1] === undefined ? this._edges : arguments[1];
    var maxExtraEdges = arguments.length <= 2 || arguments[2] === undefined ? this._maxExtraEdges : arguments[2];

    var _this = this;

    var radiiWeightPower = arguments.length <= 3 || arguments[3] === undefined ? this._radiiWeightPower : arguments[3];
    var getOpacity = arguments.length <= 4 || arguments[4] === undefined ? this._getOpacity : arguments[4];

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
      var e = objectAssign({}, edge);
      var isFadingIn = containsEdge(idealEdges, e);

      e.opacity = getOpacity.apply(_this, [isFadingIn, e]);

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
   * @param {Object}    node1
   * @param {Object}    node2
   * @param {Number}    rf
   * @type {Function}
   * @return {Object}   Node Pair instance
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
   * Create a deep (JSON compliant) copy of a given collection
   * @param {Array|Object} c
   * @type {Function}
   * @return {Array|Object}
   */
  function deepCopy(c) {
    return JSON.parse(JSON.stringify(c));
  }

  /**
   * Create array of deltas based on list of nodes
   * @param  {Array} nodes
   * @param  {Number} repulsionForce
   * @type   {Method}
   * @private
   * @return {Array}
   */
  function getNodeDeltas() {
    var nodes = arguments.length <= 0 || arguments[0] === undefined ? this._nodes : arguments[0];
    var repulsionForce = arguments.length <= 1 || arguments[1] === undefined ? this._repulsionForce : arguments[1];

    var deltas = [];
    var nodesCp = deepCopy(nodes);

    for (var i = 0; i < nodesCp.length * 2; i++) {
      deltas.push(0);
    }

    // for simplicitly, we perturb positions directly, instead of velocities
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

  var toLowerCase = function toLowerCase(s) {
    return String.prototype.slice.call(s);
  };

  /**
   * Factory that generates a Canvas Background instance
   * @param {Object}   config
   * @type {Function}
   * @return {Object}  HTML5 Canvas gradient instance
   */
  function canvasBackground(_ref) {
    var width = _ref.width;
    var height = _ref.height;
    var size = _ref.size;
    var gradient = _ref.gradient;
    var graphics = _ref.graphics;
    var background = _ref.background;

    var isGradentBackground = background instanceof Array;

    var colorStops = void 0;
    if (isGradentBackground) {
      colorStops = background;
    } else {
      colorStops = [background, background]; // fake gradient background
    }

    var canvasGradient = void 0;
    if (toLowerCase(gradient) === 'linear') {
      canvasGradient = graphics.createLinearGradient(width / 2, 0, width / 2, height);
    } else {
      canvasGradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2); // default
    }

    // add color stops to gradient
    colorStops.forEach(function (color, index, _ref2) {
      var total = _ref2.length;

      canvasGradient.addColorStop(index / (total - 1), color);
    });

    return canvasGradient;
  }

  var color = {
    _validatedHex: function _validatedHex(hex) {
      hex = ('' + hex).replace('#', '');
      return hex.length === 3 ? hex.split('').reduce(function (t, s) {
        return t + s + s;
      }, '') : hex;
    },
    hexToRGB: function hexToRGB(hex) {
      var i = parseInt(this._validatedHex(hex), 16);
      return (i >> 16 & 255) + ',' + (i >> 8 & 255) + ',' + (i & 255);
    }
  };

  var create$1 = Object.create;

  /**
   * Determines if an edge is visible
   * @param  {Object}  edge
   * @param  {Number}  mag
   * @return {Boolean}
   */

  function isEdgeVisible(edge, mag) {
    // Do edge's nodes overlap
    return mag > edge.nodeA.radius + edge.nodeB.radius;
  }

  /**
   * Generates a Canvas Frame instances
   * @param {Object}    config
   * @type {Function}
   * @return {Object}   Canvas Frame instance
   */
  function canvasFrame(config) {
    var data = objectAssign({
      // get frame dimensions
      width: config.canvasElem.width,
      height: config.canvasElem.height,
      size: Math.max(config.canvasElem.width, config.canvasElem.height)
    }, config);

    var instance = create$1({ isEdgeVisible: isEdgeVisible }, {
      background: {
        get: function get() {
          return canvasBackground(this._data);
        }
      },

      nodes: {
        get: function get() {
          var _data = this._data;
          var size = _data.size;
          var nodeSize = _data.nodeSize;
          var nodeColor = _data.nodeColor;


          return this._data.nodes.map(function (node) {
            return {
              fill: 'rgba(' + color.hexToRGB(nodeColor) + ',' + node.opacity.toFixed(3) + ')',
              arc: [node.posX * size, node.posY * size, node.radius * nodeSize, 0, Math.PI * 2]
            };
          });
        }
      },

      edges: {
        get: function get() {
          var _this = this;

          var _data2 = this._data;
          var size = _data2.size;
          var nodeSize = _data2.nodeSize;
          var edgeColor = _data2.edgeColor;


          return this._data.edges.map(function (edge) {
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
              style: 'rgba(' + color.hexToRGB(edgeColor) + ',' + opacity.toFixed(3) + ')',

              // Shorten edge so it only touches the circumference of node
              start: [(nodeA.posX - dx * (nodeA.radius * (nodeSize / size))) * size, (nodeA.posY - dy * (nodeA.radius * (nodeSize / size))) * size],
              end: [(nodeB.posX + dx * (nodeB.radius * (nodeSize / size))) * size, (nodeB.posY + dy * (nodeB.radius * (nodeSize / size))) * size]
            };
          }).filter(function (e) {
            return e;
          }); // remove invisible edges
        }
      }
    });

    return objectAssign(instance, { _data: data });
  }

  /**
   * Creates a new frame and renders it to the canvas
   * @param {Array}    nodes
   * @param {Array}    edges
   * @param {Object}   graphics
   * @param {Object}   canvasElem
   * @type {Method}
   * @private
   * @return {Object}  Canvas Frame instance
   */
  function redrawCanvas() {
    var nodes = arguments.length <= 0 || arguments[0] === undefined ? this._nodes : arguments[0];
    var edges = arguments.length <= 1 || arguments[1] === undefined ? this._edges : arguments[1];
    var canvasElem = arguments.length <= 2 || arguments[2] === undefined ? this._canvasElem : arguments[2];
    var graphics = arguments.length <= 3 || arguments[3] === undefined ? this._graphics : arguments[3];
    var background = arguments.length <= 4 || arguments[4] === undefined ? this.background : arguments[4];
    var gradient = arguments.length <= 5 || arguments[5] === undefined ? this.gradient : arguments[5];
    var nodeColor = arguments.length <= 6 || arguments[6] === undefined ? this.nodeColor : arguments[6];
    var edgeColor = arguments.length <= 7 || arguments[7] === undefined ? this.edgeColor : arguments[7];
    var edgeSize = arguments.length <= 8 || arguments[8] === undefined ? this.edgeSize : arguments[8];
    var nodeSize = arguments.length <= 9 || arguments[9] === undefined ? this.nodeSize : arguments[9];

    var frame = canvasFrame({ canvasElem: canvasElem, graphics: graphics, nodes: nodes, edges: edges, background: background, gradient: gradient, nodeColor: nodeColor, edgeColor: edgeColor, nodeSize: nodeSize });

    // Set background first (render below nodes & edges)
    graphics.fillStyle = frame.background;
    graphics.fillRect(0, 0, frame._data.width, frame._data.height);

    graphics.lineWidth = edgeSize;

    // Draw edges (render below nodes)
    frame.edges.forEach(function (e) {
      graphics.strokeStyle = e.style;
      graphics.beginPath();

      graphics.moveTo.apply(graphics, toConsumableArray(e.start));
      graphics.lineTo.apply(graphics, toConsumableArray(e.end));

      graphics.stroke(); // add to canvas
    });

    // Draw nodes (render above edges)
    frame.nodes.forEach(function (node) {
      graphics.fillStyle = node.fill;
      graphics.beginPath();
      graphics.arc.apply(graphics, toConsumableArray(node.arc));
      graphics.fill();
    });

    return frame;
  }

  /**
   * Determines input opacity
   * @param {Boolean} isFadingIn
   * @param {Object}  input
   * @param {Number} fadeInRate
   * @param {Number} fadeOutRate
   * @type {Method}
   * @private
   * @return {Number}
   */
  function getOpacity(isFadingIn, input) {
    var fadeInRate = arguments.length <= 2 || arguments[2] === undefined ? this.fadeInRate : arguments[2];
    var fadeOutRate = arguments.length <= 3 || arguments[3] === undefined ? this.fadeOutRate : arguments[3];

    if (isFadingIn) {
      return Math.min(input.opacity + fadeInRate, 1);
    } else {
      return Math.max(input.opacity - fadeOutRate, 0);
    }
  }

  /**
   * Dispurse nodes/edges instead of fade in
   * @type {Method}
   * @return {Object}  Canvas instance
   */
  function initialize() {

    // Spread out nodes to avoid ugly clumping
    for (var i = 0; i < 70; i++) {
      this.next();
    }

    return this; // allow chaining
  }

  /**
   * WARNING all side effects to canvas state (nodes/edges) are done in this method!
   * Updates nodes, edges then draws new canvas frame
   * @param {Number}   idealnodeCount
   * @param {Number}   relWidth
   * @param {Number}   relHeight
   * @param {Number}   borderFade
   * @type {Method}
   * @return {Object}  Canvas instance
   */
  function next() {
    var idealnodeCount = arguments.length <= 0 || arguments[0] === undefined ? this._idealnodeCount : arguments[0];
    var relWidth = arguments.length <= 1 || arguments[1] === undefined ? this._relWidth : arguments[1];

    var _this = this;

    var relHeight = arguments.length <= 2 || arguments[2] === undefined ? this._relHeight : arguments[2];
    var borderFade = arguments.length <= 3 || arguments[3] === undefined ? this.borderFade : arguments[3];


    // fade out nodes near the borders of the space or exceeding the target number of nodes
    var isNodeFadingOut = function isNodeFadingOut(_ref) {
      var posX = _ref.posX;
      var posY = _ref.posY;

      return posX < borderFade || relWidth - posX < borderFade || posY < borderFade || relHeight - posY < borderFade;
    };

    /*
    * important to only update existing node objects here
    * and ensure that node instances are preserved
    * which edges must to refer to via `updateEdges`.
    */

    // update current nodes' opacity
    this._nodes.map(function (node, index) {
      var isFadingIn = !(index >= idealnodeCount || isNodeFadingOut(node));
      node.opacity = _this._getOpacity(isFadingIn, node);
      return node;
    });

    // create new nodes and drop old
    this._nodes = this._updateNodes();

    /*
     * update nodes' trajectory
     */
    var deltas = this._getNodeDeltas();

    // apply "push" to nodes
    this._nodes.map(function (node, i) {
      node.posX += deltas[i * 2 + 0];
      node.posY += deltas[i * 2 + 1];
      return node;
    });

    /*
     * update edges' trajectory and opacity
     */
    this._edges = this._updateEdges(); // create new edges, update/drop existing

    /*
     * draw state to canvas
     */
    this._redrawCanvas();

    return this; // allow chaining
  }

  var properties = {

    /**
     * Calculates the desired number of nodes to render
     */
    _idealnodeCount: {

      /**
       * Ensure usable `nodeCount` is numeric
       * @return {Number}
       */

      get: function get() {
        var result = parseInt(this.nodeCount, 10);

        if (isNaN(result)) {
          throw new Error('Nayuki Canvas: `nodeCount` must be a number');
        }

        return result;
      }
    },

    /**
     * Calculates suggested max number of edges
     */
    _maxExtraEdges: {

      /**
       * Calculate usable `extraEdges`
       * @return {Number}
       */

      get: function get() {
        var extraEdges = parseInt(this.extraEdges, 10);
        var nodeCount = parseInt(this.nodeCount, 10);

        if (isNaN(extraEdges)) {
          throw new Error('Nayuki Canvas: `extraEdges` must be a number');
        }

        if (isNaN(nodeCount)) {
          throw new Error('Nayuki Canvas: `nodeCount` must be a number');
        }

        return Math.round(extraEdges / 100 * nodeCount);
      }
    },

    /**
     * Determine how edges connect to nodes
     */
    _radiiWeightPower: {

      /**
       * Calculate usable `network`
       * @type {Number}
       */

      get: function get() {
        var network = this.network;

        // ensure lowercase string

        var style = typeof network === 'string' ? network.toLowerCase() : network;

        var radiiWeightPower = 0.5; // balanced

        if (style === 'mesh') {
          radiiWeightPower = 0;
        } else if (style === 'wheel') {
          radiiWeightPower = 1;
        }

        return radiiWeightPower;
      }
    },

    /**
     * Determines the speed at which nodes move
     */
    _repulsionForce: {

      /**
       * Calculate usable `repulsion`
       * @return {Number}
       */

      get: function get() {
        var repulsion = parseFloat(this.repulsion);

        if (isNaN(repulsion)) {
          throw new Error('Nayuki Canvas: `replusion` must be a number');
        }

        return repulsion * 0.000001;
      }
    },

    /**
     * Determine the relative width of canvas
     */
    _relWidth: {

      /**
       * At least one of relWidth or relHeight is exactly 1
       * @return {Number}
       */

      get: function get() {
        var _canvasElem = this._canvasElem;
        var width = _canvasElem.width;
        var height = _canvasElem.height;

        return width / Math.max(width, height);
      }
    },

    /**
     * Determine the relative height of canvas
     */
    _relHeight: {

      /**
       * The aspect ratio `relWidth`:`relHeight` is equal to w:h
       * @return {Number}
       */

      get: function get() {
        var _canvasElem2 = this._canvasElem;
        var width = _canvasElem2.width;
        var height = _canvasElem2.height;

        return height / Math.max(width, height);
      }
    }

  };

  /**
   * Resolve the given value if a Canvas DOM element
   * otherwise resolve relevant error if not
   * @param  {Object} element DOM HTMLElment instance
   * @type   {Function}
   * @return {Object|Boolean}
   */
  function getCanvasElement() {
    var element = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _HTMLElement = arguments.length <= 1 || arguments[1] === undefined ? Function : arguments[1];

    var _jQuery = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    var toLowerCase = function toLowerCase(s) {
      return String.prototype.toLowerCase.call(s);
    };

    if (_jQuery && element instanceof _jQuery && typeof element.get === 'function') {
      element = element.get(0); // use first DOM Element in jQuery object
    }

    // is a DOM Element and has name canvas
    if (element instanceof _HTMLElement === true && toLowerCase(element.nodeName) === 'canvas') {
      return element;
    } else {
      return false;
    }
  }

  /**
   * Determines if Nayuki Canvas is supported in the current environment
   * @type {Function}
   * @return {Boolean}
   */
  function isSupported() {
    var elem = (typeof document === 'undefined' ? 'undefined' : _typeof(document)) === 'object' && document.createElement && document.createElement('canvas');
    return !!(elem && elem.getContext && elem.getContext('2d'));
  }

  var create = Object.create;


  var prototype = {
    _updateNodes: updateNodes,
    _updateEdges: updateEdges,
    _getNodeDeltas: getNodeDeltas,
    _redrawCanvas: redrawCanvas,
    _getOpacity: getOpacity,
    initialize: initialize,
    next: next
  };

  var isNodeEnv = typeof window === 'undefined' && (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object';

  /**
   * Generates new Nayuki Canvas
   * @param  {Object} canvasElem DOM Canvas Element
   * @param  {Object} options    User configuration
   * @type   {Function}
   * @return {Object}            Nayuki Canvas
   */
  function createCanvas() {
    var canvasElem = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (isNodeEnv) {
      canvasElem = {};
    } else {
      canvasElem = getCanvasElement(canvasElem, HTMLElement, window.jQuery || window.$);
    }

    if (!canvasElem) {

      // failed to resolve canvas element
      throw new Error('Nayuki Canvas: requires a Canvas element as it\'s first argument');
    }

    // overwrite config with user preferences
    var config = objectAssign({}, defaults, options);

    // create Nayuki Canvas instance
    var canvas = create(prototype, properties);

    // apply configuration to canvas
    objectAssign(canvas, config);

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
      var t = void 0;

      // allow stubbing (bind window to prevent illegal invokation in browser)
      canvas.setTimeout = setTimeout.bind(isNodeEnv ? global : window);
      canvas.clearTimeout = clearTimeout.bind(isNodeEnv ? global : window);

      /**
       * Begin reoccuring calls to `canvas.next`
       * @type   {Method}
       * @return {Object} canvas
       */
      canvas.start = function start() {
        var _this = this;

        var timer = arguments.length <= 0 || arguments[0] === undefined ? NaN : arguments[0];

        // only allow `start` calls if unstarted
        if (timer === t || t === undefined) {
          t = this.setTimeout(function () {
            _this.next();
            _this.start(t);
          }, this.frameInterval);
        }
        return this;
      };

      /**
       * Stops calls to `canvas.next`
       * @type   {Method}
       * @return {Object} canvas
       */
      canvas.stop = function stop() {
        t = this.clearTimeout(t);
        return this;
      };
    })();

    /**
     * destroing the canvas instance
     */
    canvas.destroy = function destroy() {
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

  return createCanvas;

}));
import disjointSet from './disjoint-set';

/**
 * Tests whether the given array of edge objects contains an edge with
 * the given endpoints (undirected). Pure function, no side effects.
 * @param {Array}    allEdges
 * @param {Object}   edge
 * @type {Function}
 * @return {Boolean}
 */
export function containsEdge (allEdges, edge) {
  for (let i = 0; i < allEdges.length; i++) {
    const elem = allEdges[i];
    const sameEdge = elem.nodeA === edge.nodeA && elem.nodeB === edge.nodeB;
    const symetricalEdge = elem.nodeA === edge.nodeB && elem.nodeB === edge.nodeA;

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
 * @param {Array}    allEdges
 * @param {Array}    nodes
 * @type {Function}
 * @return {Array}
 */
export function calcSpanningTree (allEdges, nodes) {

  // Kruskal's MST algorithm
  const result = [];
  const ds = disjointSet(nodes.length);

  for (let i = 0; i < allEdges.length && result.length < nodes.length - 1; i++) {
    const edge = allEdges[i];
    const [, j, k] = edge;

    if (ds.mergeSets(j, k)) {
      result.push({ nodeA: nodes[j], nodeB: nodes[k] });
    }
  }

  return result;
}

/**
 * Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
 * @param {Array}   nodes
 * @type {Function}
 * @return {Array}  [[weight, index1, index2]]
 */
export function calcAllEdgeWeights (nodes, radiiWeightPower) {

  // Each entry has the form [weight, nodeAIndex, nodeBIndex], where nodeAIndex < nodeBIndex
  const result = [];

  for (let i = 0; i < nodes.length; i++) {  // Calculate all n * (n - 1) / 2 edges
    const nodeA = nodes[i];

    for (let j = 0; j < i; j++) {
      const nodeB = nodes[j];
      let weight = Math.hypot(nodeA.posX - nodeB.posX, nodeA.posY - nodeB.posY);  // Euclidean distance
      weight /= Math.pow(nodeA.radius * nodeB.radius, radiiWeightPower);  // Give discount based on node radii
      result.push([weight, i, j]);
    }
  }

  // Sort array by ascending weight
  return result.sort(([x], [y]) => x < y ? -1 : (x > y ? 1 : 0));
}

/**
 * Create a deep (JSON compliant) copy of a given collection
 * @param {Array|Object} c
 * @type {Function}
 * @return {Array|Object}
 */
 export function deepCopy (c) {
   return JSON.parse(JSON.stringify(c));
 }

/**
 * Determines if Nayuki Canvas is supported in the current environment
 * @type {Function}
 * @return {Boolean}
 */
export function isSupported () {
  const elem = (
    typeof document === 'object' &&
    document.createElement &&
    document.createElement('canvas')
  );
  return !!(elem && elem.getContext && elem.getContext('2d'));
}

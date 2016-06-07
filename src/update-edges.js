import { calcAllEdgeWeights, calcSpanningTree, containsEdge } from './utils';

/**
 * Determines edge opacity based on if it's fading in
 * @param  Boolean isFadingIn
 * @param  Object  edge
 * @type Function
 * @return Number
 */
export function getEdgeOpacity (isFadingIn, edge, FADE_IN_RATE, FADE_OUT_RATE) {
  if (isFadingIn) {
    return Math.min(edge.opacity + FADE_IN_RATE, 1);
  } else {
    return Math.max(edge.opacity - FADE_OUT_RATE, 0);
  }
}

/**
 * Determines if an edge is active based on opacity of itself and connected nodes
 * @param  Object  edge
 * @type Function
 * @return Boolean
 */
export function isEdgeActive (edge) {
  return edge.opacity > 0 && edge.nodeA.opacity > 0 && edge.nodeB.opacity > 0;
}

/**
 * Higher order function that compares a target's array length to another
 * @param  Array  target
 * @param  Array  goal
 * @param  Number  addLength
 * @type Function
 * @return Boolean
 */
export function isTargetSmaller (target, goal, addLength = 0) {
  return () => target.length < goal.length - 1 + addLength;
}

/**
* Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
* based on the other given array. Although both argument arrays and nodes are unmodified,
* the edge objects themselves are modified. No other side effects.
* @type Method
* @return Array
*/
export default function updateEdges () {
  let i = 0;
  const { nodes, edges, maxExtraEdges, radiiWeightPower } = this;
  const { FADE_IN_RATE, FADE_OUT_RATE } = this.config;

  const newEdges = [];

  // Calculate array of spanning tree edges
  // then add some extra low-weight edges
  const allEdges = calcAllEdgeWeights(nodes, radiiWeightPower);
  const idealEdges = calcSpanningTree(allEdges, nodes);

  const idealEdgesLimitReached = isTargetSmaller(idealEdges, nodes, maxExtraEdges);
  for (i = 0; i < allEdges.length && idealEdgesLimitReached(); i++) {
    const edge = {
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
  edges.map(edge => {
    const e = Object.assign({}, edge);

    e.opacity = getEdgeOpacity(
      containsEdge(idealEdges, e),
      e,
      FADE_IN_RATE,
      FADE_OUT_RATE
    );

    if (isEdgeActive(e)) {
      newEdges.push(e);
    }
  });

  // Add necessary new edges,
  // Add some missing spanning tree edges (higher priority), then extra edges
  const newEdgesLimitReached = isTargetSmaller(newEdges, nodes, maxExtraEdges);
  for (i = 0; i < idealEdges.length && newEdgesLimitReached(); i++) {
    const edge = idealEdges[i];

    if (!containsEdge(newEdges, edge)) {
      edge.opacity = 0; // Add missing property
      newEdges.push(edge); // Add rendered edges
    }
  }

  return newEdges;
}

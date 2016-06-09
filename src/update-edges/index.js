import { calcAllEdgeWeights, calcSpanningTree, containsEdge } from '../utils';
import isEdgeActive from './is-edge-active';
import isTargetSmaller from './is-target-smaller';

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
export default function updateEdges (nodes = this.nodes, edges = this.edges, maxExtraEdges = this.maxExtraEdges, radiiWeightPower = this.radiiWeightPower) {
  const newEdges = [];

  // calculate array of spanning tree edges
  const allEdges = calcAllEdgeWeights(nodes, radiiWeightPower);
  const idealEdges = calcSpanningTree(allEdges, nodes);
  const idealEdgesLimitReached = isTargetSmaller(idealEdges, nodes, maxExtraEdges);

  // add some extra low-weight edges to `idealEdges`
  for (let i = 0; i < allEdges.length && idealEdgesLimitReached(); i++) {
    const edge = {
      nodeA: nodes[allEdges[i][1]],
      nodeB: nodes[allEdges[i][2]]
    };

    if (!containsEdge(idealEdges, edge)) {
      idealEdges.push(edge);
    }
  }

  // update existing egdge opacity and prune faded edges
  edges.map(edge => {
    const e = Object.assign({}, edge);
    const isFadingIn = containsEdge(idealEdges, e);

    e.opacity = this._getOpacity(isFadingIn, e);

    if (isEdgeActive(e)) {
      newEdges.push(e);
    }
  });

  const newEdgesLimitReached = isTargetSmaller(newEdges, nodes, maxExtraEdges);

  // add new, missing spanning tree edges (high priority), and extra edges
  for (let j = 0; j < idealEdges.length && newEdgesLimitReached(); j++) {
    const edge = idealEdges[j];

    if (!containsEdge(newEdges, edge)) {
      edge.opacity = 0; // add missing property
      newEdges.push(edge); // add rendered edges
    }
  }

  return newEdges;
}

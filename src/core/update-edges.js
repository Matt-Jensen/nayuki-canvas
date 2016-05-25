import { calcAllEdgeWeights, calcSpanningTree, containsEdge } from '../utils';

/*
* Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
* based on the other given array. Although both argument arrays and nodes are unmodified,
* the edge objects themselves are modified. No other side effects.
*/
export default function updateEdges () {
  let i = 0;
  const { nodes, edges } = this;

  // Calculate array of spanning tree edges, then add some extra low-weight edges
  let allEdges = calcAllEdgeWeights(nodes, this.radiiWeightPower);
  const idealEdges = calcSpanningTree(allEdges, nodes);

  for (i = 0; i < allEdges.length && idealEdges.length < nodes.length - 1 + this.maxExtraEdges; i++) {
    const edge = { nodeA: nodes[allEdges[i][1]], nodeB: nodes[allEdges[i][2]] };  // Convert data formats
    if (!containsEdge(idealEdges, edge)) {
      idealEdges.push(edge);
    }
  }
  allEdges = null;  // Let this big array become garbage sooner

  // Classify each current edge, checking whether it is in the ideal set; prune faded edges
  const newEdges = [];
  edges.forEach((edge) => {
    if (containsEdge(idealEdges, edge)) {
      edge.opacity = Math.min(edge.opacity + this.config.FADE_IN_RATE, 1);
    } else {
      edge.opacity = Math.max(edge.opacity - this.config.FADE_OUT_RATE, 0);
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
}

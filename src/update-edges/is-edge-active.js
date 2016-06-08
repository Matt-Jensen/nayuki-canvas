/**
 * Determines if an edge is active based on opacity of itself and connected nodes
 * @param {Object}  edge
 * @type {Function}
 * @return {Boolean}
 */
export default function isEdgeActive (edge) {
  return edge.opacity > 0 && edge.nodeA.opacity > 0 && edge.nodeB.opacity > 0;
}

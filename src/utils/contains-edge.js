/**
 * Tests whether the given array of edge objects contains an edge with
 * the given endpoints (undirected). Pure function, no side effects.
 * @param {Array}    allEdges
 * @param {Object}   edge
 * @type {Function}
 * @return {Boolean}
 */
export default function containsEdge (allEdges, edge) {
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

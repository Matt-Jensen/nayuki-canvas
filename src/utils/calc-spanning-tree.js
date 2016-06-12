import disjointSet from '../disjoint-set';

/**
 * Returns a new array of edge objects that is a minimal spanning tree on the given set
 * of nodes, with edges in ascending order of weight. Note that the returned edge objects
 * are missing the opacity property. Pure function, no side effects.
 * @param {Array}    allEdges
 * @param {Array}    nodes
 * @type {Function}
 * @return {Array}
 */
export default function calcSpanningTree (allEdges, nodes) {

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

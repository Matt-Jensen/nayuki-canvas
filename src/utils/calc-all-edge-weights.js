/**
 * Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
 * @param {Array}     nodes
 * @param {Number}    radiiWeightPower
 * @type {Function}
 * @return {Array}    [[weight, index1, index2]]
 */
export default function calcAllEdgeWeights (nodes, radiiWeightPower) {

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

import nodePair from './node-pair';

/**
 * create array of deltas based on list of nodes
 * @param  {Array} nodes
 * @param  {Number} repulsionForce
 * @return {Array}
 */
export default function nodeDeltas(nodes, repulsionForce) {
  let i = 0;
  const deltas = [];

  for (i = 0; i < nodes.length * 2; i++) {
    deltas.push(0);
  }

  // For simplicitly, we perturb positions directly, instead of velocities
  nodes.forEach(function(nodeA, i) {
    for (let j = 0; j < i; j++) {
      const np = nodePair(nodeA, nodes[j], repulsionForce);
      const { dx, dy } = np.deltas;
      deltas[i * 2 + 0] += dx;
      deltas[i * 2 + 1] += dy;
      deltas[j * 2 + 0] -= dx;
      deltas[j * 2 + 1] -= dy;
    }
  });

  return deltas;
}

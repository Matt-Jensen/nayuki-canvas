import nodePair from './node-pair';
import { deepCopy } from '../utils';

/**
 * Create array of deltas based on list of nodes
 * @param  {Array} nodes
 * @param  {Number} repulsionForce
 * @type   {Method}
 * @private
 * @return {Array}
 */
function getNodeDeltas (nodes = this.nodes, repulsionForce = this.repulsionForce) {
  const deltas = [];
  const nodesCp = deepCopy(nodes);

  for (let i = 0; i < nodesCp.length * 2; i++) {
    deltas.push(0);
  }

  // for simplicitly, we perturb positions directly, instead of velocities
  nodesCp.forEach((nodeA, k) => {
    for (let j = 0; j < k; j++) {
      const np = nodePair(nodeA, nodesCp[j], repulsionForce);
      const { dx, dy } = np.deltas;
      deltas[k * 2 + 0] += dx;
      deltas[k * 2 + 1] += dy;
      deltas[j * 2 + 0] -= dx;
      deltas[j * 2 + 1] -= dy;
    }
  });

  return deltas;
}

export default getNodeDeltas;

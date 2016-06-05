/**
 * Factory that produces grouping of caclulations based on a pair of nodes
 * @type {Object}
 */
const nodePair = {
  create(nodeA, nodeB, repulsionForce) {
    return Object.create(null, {
      nodeA: { value: nodeA },
      nodeB: { value: nodeB },
      repulsionForce: { value: repulsionForce },
      x: {
        get() {
          const { nodeA, nodeB } = this;
          return nodeA.posX - nodeB.posX;
        }
      },
      y: {
        get() {
          const { nodeA, nodeB } = this;
          return nodeA.posY - nodeB.posY;
        }
      },
      distSqr: {
        get() {
          const { x, y } = this;
          return x * x + y * y;
        }
      },

      /**
       * 1/sqrt(distSqr) make (x, y) into a unit vector
       * 1/distSqr is the inverse square law, with a smoothing constant added to prevent singularity.
       * @return {Number}
       */
      factor: {
        get() {
          const { distSqr, repulsionForce } = this;
          return repulsionForce / (Math.sqrt(distSqr) * (distSqr + 0.00001));
        }
      },
      deltas: {
        get() {
          const { x, y, factor } = this;
          return {
            dx: (x * factor),
            dy: (y * factor)
          };
        }
      }
    });
  }
};

/**
 * create array of deltas based on list of nodes
 * @param  {Array} nodes
 * @param  {Number} repulsionForce
 * @return {Array}
 */
function createNodeDeltas(nodes, repulsionForce) {
  let i = 0;
  const deltas = [];

  for (i = 0; i < nodes.length * 2; i++) {
    deltas.push(0);
  }

  // For simplicitly, we perturb positions directly, instead of velocities
  nodes.forEach(function(nodeA, i) {
    for (let j = 0; j < i; j++) {
      const np = nodePair.create(nodeA, nodes[j], repulsionForce);
      const { dx, dy } = np.deltas;
      deltas[i * 2 + 0] += dx;
      deltas[i * 2 + 1] += dy;
      deltas[j * 2 + 0] -= dx;
      deltas[j * 2 + 1] -= dy;
    }
  });

  return deltas;
}

/**
* Updates the position of each node in the given array (in place), based on
* their existing positions. Returns nothing.
* @type {Method}
* @return {Array} (list of updated nodes)
*/
export default function getForceField (nodes) {
  const { repulsionForce } = this;

  if (!nodes) {
    nodes = this.nodes;
  }

  const resultNodes = Array.prototype.slice.call(nodes); // clone `nodes`
  const deltas = createNodeDeltas(resultNodes, repulsionForce);

  return resultNodes.map(function(node, i) {
    node.posX += deltas[i * 2 + 0];
    node.posY += deltas[i * 2 + 1];
    return node;
  });
}

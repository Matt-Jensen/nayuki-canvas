/**
 * Factory that produces grouping of caclulations based on a pair of nodes
 * @type {Function}
 */
export default function nodePair(nodeA, nodeB, repulsionForce) {
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

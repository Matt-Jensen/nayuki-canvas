import canvasBackground from './canvas-background';

function isEdgeVisible (edge, mag) {
  // Do edge's nodes overlap
  return mag > edge.nodeA.radius + edge.nodeB.radius;
}

/**
 * Generates a Canvas Frame instances
 * @type {Function}
 * @return {Object} (Canvas Frame)
 */
export default function canvasFrame(config) {
  const defaults = {
    // get frame dimensions
    width: config.canvasElem.width,
    height: config.canvasElem.height,
    size: Math.max(config.canvasElem.width, config.canvasElem.height)
  };

  const instance = Object.create({ isEdgeVisible }, {
    background: {
      get () {
        return canvasBackground(this.data).gradient; // TODO make gradient type configurable
      }
    },

    nodes: {
      get () {
        const { size } = this.data;
        const color = '129,139,197'; // TODO make node color configurable

        return this.data.nodes.map(node => ({
          fill: `rgba(${color},${node.opacity.toFixed(3)})`,
          arc: [node.posX * size, node.posY * size, node.radius * size, 0, Math.PI * 2]
        }));
      }
    },

    edges: {
      get () {
        const { size } = this.data;
        const color = '129,139,197'; // TODO make edge color configurable

        return this.data.edges.map(edge => {
          const { nodeA, nodeB } = edge;

          let dx = nodeA.posX - nodeB.posX;
          let dy = nodeA.posY - nodeB.posY;

          const opacity = Math.min(Math.min(nodeA.opacity, nodeB.opacity), edge.opacity);
          const mag = Math.hypot(dx, dy);

          dx /= mag; // make dx a unit vector, pointing from B to A
          dy /= mag; // make dy a unit vector, pointing from B to A

          if (this.isEdgeVisible(edge, mag) === false) {
            return false; // don't render
          }

          return {
            style: `rgba(${color},${opacity.toFixed(3)})`,

            // Shorten edge so it only touches the circumference of node
            start: [
              (nodeA.posX - dx * nodeA.radius) * size,
              (nodeA.posY - dy * nodeA.radius) * size
            ],
            end: [
              (nodeB.posX + dx * nodeB.radius) * size,
              (nodeB.posY + dy * nodeB.radius) * size
            ]
          };
        })
        .filter(e => e); // remove invisible edges
      }
    }
  });

  return Object.assign(instance, { data: Object.assign(defaults, config) });
};

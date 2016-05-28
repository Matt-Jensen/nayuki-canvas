import frameBackground from './frame-background';

function isEdgeVisible (edge, mag) {
  // Do edge's nodes overlap
  return mag > edge.nodeA.radius + edge.nodeB.radius;
}

/**
 * Factory that generates Frame instances
 * @type Object
 */
export default {

  /**
   * Generates a Canvas Frame instances
   * @type Method
   * @return Object (Canvas Frame)
   */
  create (config) {
    const data = Object.assign({
      // Get frame dimensions
      width: config.canvasElem.width,
      height: config.canvasElem.height,
      size: Math.max(config.canvasElem.width, config.canvasElem.height)
    }, config);

    return Object.create({ data, frameBackground, isEdgeVisible }, {
      background: {
        get () {
          return this.frameBackground.create(this.data).radialGradient; // TODO make gradient type configurable
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

            dx /= mag; // Make dx a unit vector, pointing from B to A
            dy /= mag; // Make dy a unit vector, pointing from B to A

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
          .filter(e => e); // remove non-interesting edges
        }
      }
    });
  }
};

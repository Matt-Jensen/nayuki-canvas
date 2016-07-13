import canvasBackground from './canvas-background';
import color from '../utils/color';

// polyfills
import assign from '../utils/object-assign';

const { create } = Object;

/**
 * Determines if an edge is visible
 * @param  {Object}  edge
 * @param  {Number}  mag
 * @return {Boolean}
 */
function isEdgeVisible (edge, mag) {
  // Do edge's nodes overlap
  return mag > edge.nodeA.radius + edge.nodeB.radius;
}

/**
 * Generates a Canvas Frame instances
 * @param {Object}    config
 * @type {Function}
 * @return {Object}   Canvas Frame instance
 */
export default function canvasFrame (config) {
  const data = assign({
    // get frame dimensions
    width: config.canvasElem.width,
    height: config.canvasElem.height,
    size: Math.max(config.canvasElem.width, config.canvasElem.height)
  }, config);

  const instance = create({ isEdgeVisible }, {
    background: {
      get () {
        return canvasBackground(this._data);
      }
    },

    nodes: {
      get () {
        const { size, nodeSize, nodeColor } = this._data;

        return this._data.nodes.map(node => ({
          fill: `rgba(${color.hexToRGB(nodeColor)},${node.opacity.toFixed(3)})`,
          arc: [node.posX * size, node.posY * size, node.radius * nodeSize, 0, Math.PI * 2]
        }));
      }
    },

    edges: {
      get () {
        const { size, nodeSize, edgeColor } = this._data;

        return this._data.edges.map(edge => {
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
            style: `rgba(${color.hexToRGB(edgeColor)},${opacity.toFixed(3)})`,

            // Shorten edge so it only touches the circumference of node
            start: [
              (nodeA.posX - dx * (nodeA.radius * (nodeSize / size))) * size,
              (nodeA.posY - dy * (nodeA.radius * (nodeSize / size))) * size
            ],
            end: [
              (nodeB.posX + dx * (nodeB.radius * (nodeSize / size))) * size,
              (nodeB.posY + dy * (nodeB.radius * (nodeSize / size))) * size
            ]
          };
        })
        .filter(e => e); // remove invisible edges
      }
    }
  });

  return assign(instance, { _data: data });
}

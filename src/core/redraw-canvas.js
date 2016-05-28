/**
 * Factory that generates a Frame Background instance
 * @type Object
 */
const frameBackground = {

  /**
   * Generates a Frame Background instance
   * @type Method
   * @return Object (Frame Background)
   */
  create (config) {
    const data = Object.assign({
      startColor: '#575E85', // TODO make gradient start color configurable
      stopColor: '#2E3145' // TODO make gradient end color configurable
      //, background: '' // TODO allow single color backgrounds
    }, config);

    return Object.create({ data }, {
      radialGradient: {
        get () {
          const { width, height, size, graphics, startColor, stopColor } = this.data;
          const gradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2);
          gradient.addColorStop(0.0, startColor);
          gradient.addColorStop(1.0, stopColor);
          return gradient;
        }
      }
    });
  }
};

/**
 * Factory that generates Frame instances
 * @type Object
 */
const canvasFrame = {

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

    return Object.create({ data }, {
      background: {
        get () {
          return frameBackground.create(this.data).radialGradient; // TODO make gradient type configurable
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

            // If circles don't intersect ignore
            if (mag <= nodeA.radius + nodeB.radius) {
              return false;
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

/**
 * Creates a new frame and renders it to the canvas
 * @type Method
 * @return Frame (generated frame instance)
 */
export default function redrawCanvas () {
  const { canvasElem, graphics, nodes, edges } = this;
  const frame = canvasFrame.create({ canvasElem, graphics, nodes, edges });

  // Set background first (render below nodes & edges)
  graphics.fillStyle = frame.background;
  graphics.fillRect(0, 0, frame.data.width, frame.data.height);

  // Draw nodes (render below edges)
  frame.nodes
  .forEach(node => {
    graphics.fillStyle = node.fill;
    graphics.beginPath();
    graphics.arc(...node.arc);
    graphics.fill();
  });

  graphics.lineWidth = (frame.data.size / 800); // TODO make edge width configurable

  // Draw edges (render on top)
  frame.edges
  .forEach(e => {
    graphics.strokeStyle = e.style;
    graphics.beginPath();

    graphics.moveTo(...e.start);
    graphics.lineTo(...e.end);

    graphics.stroke(); // add to canvas
  });

  return frame;
}

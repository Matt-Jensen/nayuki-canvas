import canvasFrame from './canvas-frame';

/**
 * Creates a new frame and renders it to the canvas
 * @param {Array}    nodes
 * @param {Array}    edges
 * @param {Object}   graphics
 * @param {Object}   canvasElem
 * @type {Method}
 * @private
 * @return {Object}  Canvas Frame instance
 */
export default function redrawCanvas (nodes = this.nodes, edges = this.edges, graphics = this.graphics, canvasElem = this.canvasElem) {
  const frame = canvasFrame({ canvasElem, graphics, nodes, edges });

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

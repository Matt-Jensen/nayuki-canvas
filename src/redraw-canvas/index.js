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
export default function redrawCanvas (nodes = this._nodes, edges = this._edges, canvasElem = this._canvasElem, graphics = this._graphics, background = this.background, gradient = this.gradient, nodeColor = this.nodeColor, edgeColor = this.edgeColor, edgeSize = this.edgeSize, nodeSize = this.nodeSize) {
  const frame = canvasFrame({ canvasElem, graphics, nodes, edges, background, gradient, nodeColor, edgeColor, nodeSize });

  // Set background first (render below nodes & edges)
  graphics.fillStyle = frame.background;
  graphics.fillRect(0, 0, frame._data.width, frame._data.height);

  graphics.lineWidth = edgeSize;

  // Draw edges (render below nodes)
  frame.edges
  .forEach(e => {
    graphics.strokeStyle = e.style;
    graphics.beginPath();

    graphics.moveTo(...e.start);
    graphics.lineTo(...e.end);

    graphics.stroke(); // add to canvas
  });

  // Draw nodes (render above edges)
  frame.nodes
  .forEach(node => {
    graphics.fillStyle = node.fill;
    graphics.beginPath();
    graphics.arc(...node.arc);
    graphics.fill();
  });

  return frame;
}

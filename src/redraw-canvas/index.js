import canvasFrame from './canvas-frame';

/**
 * Creates a new frame and renders it to the canvas
 * @type {Method}
 * @return {Frame} (generated frame instance)
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

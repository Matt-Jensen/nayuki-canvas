// Redraws the canvas based on the given values. No other side effects.
export default function redrawCanvas () {
  const { canvasElem, graphics, nodes, edges } = this;

  // Get pixel dimensions
  const { width, height } = canvasElem;
  const size = Math.max(width, height);

  // Draw background gradient to overwrite everything
  const gradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2);
  gradient.addColorStop(0.0, '#575E85');
  gradient.addColorStop(1.0, '#2E3145');
  graphics.fillStyle = gradient;
  graphics.fillRect(0, 0, width, height);

  // Draw every node
  nodes.forEach((node) => {
    graphics.fillStyle = `rgba(129,139,197,${node.opacity.toFixed(3)})`;
    graphics.beginPath();
    graphics.arc(node.posX * size, node.posY * size, node.radius * size, 0, Math.PI * 2);
    graphics.fill();
  });

  // Draw every edge
  graphics.lineWidth = size / 800;
  edges.forEach((edge) => {
    const { nodeA, nodeB } = edge;
    let dx = nodeA.posX - nodeB.posX;
    let dy = nodeA.posY - nodeB.posY;
    const mag = Math.hypot(dx, dy);

    if (mag > nodeA.radius + nodeB.radius) {  // Draw edge only if circles don't intersect
      dx /= mag;  // Make (dx, dy) a unit vector, pointing from B to A
      dy /= mag;

      const opacity = Math.min(Math.min(nodeA.opacity, nodeB.opacity), edge.opacity);
      graphics.strokeStyle = `rgba(129,139,197,${opacity.toFixed(3)})`;
      graphics.beginPath();

      // Shorten the edge so that it only touches the circumference of each circle
      graphics.moveTo(
        (nodeA.posX - dx * nodeA.radius) * size,
        (nodeA.posY - dy * nodeA.radius) * size
      );
      graphics.lineTo(
        (nodeB.posX + dx * nodeB.radius) * size,
        (nodeB.posY + dy * nodeB.radius) * size
      );

      // add to canvas
      graphics.stroke();
    }
  });
}

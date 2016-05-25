/*
* Returns a new array of nodes by updating/adding/removing nodes based on the given array. Although the
* argument array is not modified, the node objects themselves are modified. No other side effects.
*/
export default function updateNodes () {
  const pixWidth = this.canvasElem.width;
  const pixHeight = this.canvasElem.height;
  const { nodes } = this;

  // At least one of relWidth or relHeight is exactly 1. The aspect ratio relWidth:relHeight is equal to w:h.
  const relWidth = pixWidth / Math.max(pixWidth, pixHeight);
  const relHeight = pixHeight / Math.max(pixWidth, pixHeight);

  // Update position, velocity, opacity; prune faded nodes
  const newNodes = [];
  nodes.forEach((node, index) => {

    // Move based on velocity
    node.posX += node.velX * this.driftSpeed;
    node.posY += node.velY * this.driftSpeed;

    // Randomly perturb velocity, with damping
    node.velX = node.velX * 0.99 + (Math.random() - 0.5) * 0.3;
    node.velY = node.velY * 0.99 + (Math.random() - 0.5) * 0.3;

    // Fade out nodes near the borders of the space or exceeding the target number of nodes
    if (index >= this.idealNumNodes || node.posX < this.config.BORDER_FADE || relWidth - node.posX < this.config.BORDER_FADE || node.posY < this.config.BORDER_FADE || relHeight - node.posY < this.config.BORDER_FADE) {
      node.opacity = Math.max(node.opacity - this.config.FADE_OUT_RATE, 0);
    } else { // Fade in ones otherwise
      node.opacity = Math.min(node.opacity + this.config.FADE_IN_RATE, 1);
    }

    if (node.opacity > 0) {

      // Only keep visible nodes
      newNodes.push(node);
    }
  });

  // Add new nodes to fade in
  for (let i = newNodes.length; i < this.idealNumNodes; i++) {
    newNodes.push({ // Random position and radius, other properties initially zero
      posX: Math.random() * relWidth,
      posY: Math.random() * relHeight,
      radius: (Math.pow(Math.random(), 5) + 0.35) * 0.015,  // Skew toward smaller values
      velX: 0.0,
      velY: 0.0,
      opacity: 0.0,
    });
  }

  // Spread out nodes a bit
  this.doForceField();

  return newNodes;
}

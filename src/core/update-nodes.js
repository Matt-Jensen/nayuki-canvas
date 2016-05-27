export function getNodeTrajectory ({ posX, posY, velX, velY }, driftSpeed) {
  return {
    // Move based on velocity
    posX: posX + (velX * driftSpeed),
    posY: posY + (velY * driftSpeed),

    // Randomly perturb velocity, with damping
    velX: velX * 0.99 + (Math.random() - 0.5) * 0.3,
    velY: velY * 0.99 + (Math.random() - 0.5) * 0.3
  };
}

export function getNodeOpacity (isFadingOut, opacity, FADE_IN_RATE, FADE_OUT_RATE) {
  if (isFadingOut) {
    return Math.max(opacity - FADE_OUT_RATE, 0);
  } else { // Fade in ones otherwise
    return Math.min(opacity + FADE_IN_RATE, 1);
  }
}

/*
* Returns a new array of nodes by updating/adding/removing nodes based on the given array. Although the
* argument array is not modified, the node objects themselves are modified. No other side effects.
*/
export default function updateNodes () {
  const { width, height } = this.canvasElem;
  const { nodes, idealNumNodes, driftSpeed } = this;
  const { FADE_IN_RATE, FADE_OUT_RATE, BORDER_FADE } = this.config;

  // At least one of relWidth or relHeight is exactly 1. The aspect ratio relWidth:relHeight is equal to w:h.
  const relWidth = width / Math.max(width, height);
  const relHeight = height / Math.max(width, height);

  // nodes to render
  const newNodes = [];

  // Fade out nodes near the borders of the space or exceeding the target number of nodes
  const isNodeFadingOut = (node, index) => {
    return index >= idealNumNodes || node.posX < BORDER_FADE || relWidth - node.posX < BORDER_FADE || node.posY < BORDER_FADE || relHeight - node.posY < BORDER_FADE;
  };

  // Update position, velocity, opacity; prune faded nodes
  nodes.map((node, index) => {

    // update node with new position & velocity
    Object.assign({}, node, getNodeTrajectory(node, driftSpeed));

    // update node opacity
    node.opacity = getNodeOpacity(
      isNodeFadingOut(node, index),
      node.opacity,
      FADE_IN_RATE,
      FADE_OUT_RATE
    );

    // Only keep visible nodes
    if (node.opacity > 0) {
      newNodes.push(node);
    }
  });

  // Add new nodes to fade in
  for (let i = newNodes.length; i < idealNumNodes; i++) {
    newNodes.push({ // Random position and radius, other properties initially zero
      posX: Math.random() * relWidth,
      posY: Math.random() * relHeight,
      radius: (Math.pow(Math.random(), 5) + 0.35) * 0.015,  // Skew toward smaller values
      velX: 0.0,
      velY: 0.0,
      opacity: 0.0
    });
  }

  return newNodes;
}

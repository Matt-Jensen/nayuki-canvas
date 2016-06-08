import getNodeTrajectory from './get-node-trajectory';

/**
* Returns an array of updated nodes
* Updates/adds/removes current nodes based on the given array
* @type {Method}
* @return {Array} Nodes
*/
export default function updateNodes () {
  const { width, height } = this.canvasElem;
  const {
    nodes,
    idealNumNodes,
    driftSpeed,
    BORDER_FADE
  } = this;

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
    // TODO remove code (not doing anything)
    // update node with new position & velocity
    Object.assign({}, node, getNodeTrajectory(node, driftSpeed));

    // update node opacity
    const isFadingIn = !isNodeFadingOut(node, index);
    node.opacity = this._getOpacity(isFadingIn, node);

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

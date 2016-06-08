/**
* Returns an array of updated nodes
* Updates/adds/removes current nodes based on the given array
* @type {Method}
* @return {Array} Nodes
*/
export default function updateNodes () {
  const {
    nodes,
    idealNumNodes,
    relWidth,
    relHeight
  } = this;

  // nodes to render
  const newNodes = [];

  // Only keep visible nodes
  nodes.map(node => {
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
      velX: 0,
      velY: 0,
      opacity: 0
    });
  }

  return newNodes;
}

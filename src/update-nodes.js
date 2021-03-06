/**
* Returns an array of updated nodes
* Updates/adds/removes current nodes based on the given array
* @param {Array}    nodes
* @param {Number}   idealnodeCount
* @param {Number}   relWidth
* @param {Number}   relHeight
* @type {Method}
* @private
* @return {Array}  Nodes
*/
export default function updateNodes (nodes = this._nodes, idealnodeCount = this._idealnodeCount, relWidth = this._relWidth, relHeight = this._relHeight) {
  const newNodes = []; // nodes to render

  // Only keep visible nodes
  nodes.map(node => {
    if (node.opacity > 0) {
      newNodes.push(node);
    }
  });

  // Add new nodes to fade in
  for (let i = newNodes.length; i < idealnodeCount; i++) {
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

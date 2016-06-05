import nodeDeltas from './node-deltas';

/**
* Updates the position of each node in the given array (in place), based on
* their existing positions. Returns nothing.
* @type {Method}
* @return {Array} (list of updated nodes)
*/
export default function getPushNodes (nodes) {
  const { repulsionForce } = this;

  if (!nodes) {
    nodes = this.nodes;
  }

  const resultNodes = Array.prototype.slice.call(nodes); // clone `nodes`
  const deltas = nodeDeltas(resultNodes, repulsionForce);

  return resultNodes.map(function(node, i) {
    node.posX += deltas[i * 2 + 0];
    node.posY += deltas[i * 2 + 1];
    return node;
  });
}

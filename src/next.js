/**
 * WARNING all side effects to canvas state (nodes/edges) are done in this method!
 * Updates nodes, edges then draws new canvas frame
 * @param {Number}   idealNumNodes
 * @param {Number}   relWidth
 * @param {Number}   relHeight
 * @param {Number}   BORDER_FADE
 * @type {Method}
 * @return {Object}  Canvas instance
 */
export default function next (idealNumNodes = this.idealNumNodes, relWidth = this.relWidth, relHeight = this.relHeight, BORDER_FADE = this.BORDER_FADE) {

  // fade out nodes near the borders of the space or exceeding the target number of nodes
  // TODO make private prototype method
  const isNodeFadingOut = function ({ posX, posY }) {
    return posX < BORDER_FADE || relWidth - posX < BORDER_FADE || posY < BORDER_FADE || relHeight - posY < BORDER_FADE;
  };

  /*
  * important to only update existing node objects here
  * and ensure that node instances are preserved
  * which edges must to refer to via `updateEdges`.
  */

  // update current nodes' opacity
  this.nodes.map((node, index) => {
    const isFadingIn = !(index >= idealNumNodes || isNodeFadingOut(node));
    node.opacity = this._getOpacity(isFadingIn, node);
    return node;
  });

  this.nodes = this._updateNodes(); // create new nodes and drop old

  /*
   * update nodes' trajectory
   */
  const deltas = this.getNodeDeltas();

  // apply "push" to nodes
  this.nodes.map(function (node, i) {
    node.posX += deltas[i * 2 + 0];
    node.posY += deltas[i * 2 + 1];
    return node;
  });

  /*
   * update edges' trajectory and opacity
   */
  this.edges = this._updateEdges(); // create new edges, update/drop existing

  /*
   * draw state to canvas
   */
  this.redrawCanvas();

  return this; // allow chaining
}

/**
 * WARNING all side effects to canvas state (nodes/edges) are done in this method!
 * Updates nodes, edges then draws new canvas frame
 * @param {Number}   idealnodeCount
 * @param {Number}   relWidth
 * @param {Number}   relHeight
 * @param {Number}   borderFade
 * @type {Method}
 * @return {Object}  Canvas instance
 */
export default function next (idealnodeCount = this._idealnodeCount, relWidth = this._relWidth, relHeight = this._relHeight, borderFade = this.borderFade) {

  // fade out nodes near the borders of the space or exceeding the target number of nodes
  const isNodeFadingOut = function ({ posX, posY }) {
    return posX < borderFade || relWidth - posX < borderFade || posY < borderFade || relHeight - posY < borderFade;
  };

  /*
  * important to only update existing node objects here
  * and ensure that node instances are preserved
  * which edges must to refer to via `updateEdges`.
  */

  // update current nodes' opacity
  this._nodes.map((node, index) => {
    const isFadingIn = !(index >= idealnodeCount || isNodeFadingOut(node));
    node.opacity = this._getOpacity(isFadingIn, node);
    return node;
  });

  // create new nodes and drop old
  this._nodes = this._updateNodes();

  /*
   * update nodes' trajectory
   */
  const deltas = this._getNodeDeltas();

  // apply "push" to nodes
  this._nodes.map(function (node, i) {
    node.posX += deltas[i * 2 + 0];
    node.posY += deltas[i * 2 + 1];
    return node;
  });

  /*
   * update edges' trajectory and opacity
   */
  this._edges = this._updateEdges(); // create new edges, update/drop existing

  /*
   * draw state to canvas
   */
  this._redrawCanvas();

  return this; // allow chaining
}

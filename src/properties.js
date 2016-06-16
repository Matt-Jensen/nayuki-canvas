export default {

  /**
   * Calculates the desired number of nodes to render
   */
  _idealnodeCount: {

    /**
     * Ensure usable `nodeCount` is numeric
     * @return {Number}
     */
    get () {
      const result = parseInt(this.nodeCount, 10);

      if (isNaN(result)) {
        throw new Error('Nayuki Canvas: `nodeCount` must be a number');
      }

      return result;
    }
  },

  /**
   * Calculates suggested max number of edges
   */
  _maxExtraEdges: {

    /**
     * Calculate usable `extraEdges`
     * @return {Number}
     */
    get () {
      const extraEdges = parseInt(this.extraEdges, 10);
      const nodeCount = parseInt(this.nodeCount, 10);

      if (isNaN(extraEdges)) {
        throw new Error('Nayuki Canvas: `extraEdges` must be a number');
      }

      if (isNaN(nodeCount)) {
        throw new Error('Nayuki Canvas: `nodeCount` must be a number');
      }

      return Math.round(extraEdges / 100 * nodeCount);
    }
  },

  /**
   * Determine how edges connect to nodes
   */
  _radiiWeightPower: {

    /**
     * Calculate usable `network`
     * @type {Number}
     */
    get () {
      const { network } = this;

      // ensure lowercase string
      const style = (typeof network === 'string' ? network.toLowerCase() : network);

      let radiiWeightPower = 0.5; // balanced

      if (style === 'mesh') {
        radiiWeightPower = 0;
      } else if (style === 'wheel') {
        radiiWeightPower = 1;
      }

      return radiiWeightPower;
    }
  },

  /**
   * Determines the speed at which nodes move
   */
  _repulsionForce: {

    /**
     * Calculate usable `repulsion`
     * @return {Number}
     */
    get () {
      const repulsion = parseFloat(this.repulsion);

      if (isNaN(repulsion)) {
        throw new Error('Nayuki Canvas: `replusion` must be a number');
      }

      return repulsion * 0.000001;
    }
  },

  /**
   * Determine the relative width of canvas
   */
  _relWidth: {

    /**
     * At least one of relWidth or relHeight is exactly 1
     * @return {Number}
     */
    get () {
      const { width, height } = this._canvasElem;
      return width / Math.max(width, height);
    }
  },

  /**
   * Determine the relative height of canvas
   */
  _relHeight: {

    /**
     * The aspect ratio `relWidth`:`relHeight` is equal to w:h
     * @return {Number}
     */
    get () {
      const { width, height } = this._canvasElem;
      return height / Math.max(width, height);
    }
  },

  /**
   * TODO fadeInRate proxy that keeps in between (0.0 - 1.0)
   * _fadeInRate: {}
   */

   /**
    * TODO fadeOutRate proxy that keeps in between (0.0 - 1.0)
    * _fadeOutRate: {}
    */
};

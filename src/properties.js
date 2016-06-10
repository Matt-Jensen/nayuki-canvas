export default {

  /**
   * Calculates the desired number of nodes to render
   */
  idealNumNodes: {

    /**
     * Ensure usable `numNodes` is numeric
     * @return {Number}
     */
    get () {
      const result = parseInt(this.numNodes, 10);

      if (isNaN(result)) {
        throw new Error('Nayuki Canvas: `numNodes` must be a number');
      }

      return result;
    }
  },

  /**
   * Calculates suggested max number of edges
   */
  maxExtraEdges: {

    /**
     * Calculate usable `maxExtraEdges`
     * @return {Number}
     */
    get () {
      const extraEdges = parseInt(this.extraEdges, 10);
      const numNodes = parseInt(this.numNodes, 10);

      if (isNaN(extraEdges)) {
        throw new Error('Nayuki Canvas: `extraEdges` must be a number')
      }

      if (isNaN(numNodes)) {
        throw new Error('Nayuki Canvas: `numNodes` must be a number')
      }

      return Math.round(extraEdges / 100 * numNodes);
    }
  },

  /**
   * Determine how edges connect to nodes
   */
  radiiWeightPower: {

    /**
     * Calculate usable `networkStyle`
     * @type {Number}
     */
    get () {
      const { networkStyle } = this;

      // ensure lowercase string
      const style = (typeof networkStyle === 'string' ? networkStyle.toLowerCase() : networkStyle);

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
  repulsionForce: {

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
  relWidth: {

    /**
     * At least one of relWidth or relHeight is exactly 1
     * @return {Number}
     */
    get () {
      const { width, height } = this.canvasElem;
      return width / Math.max(width, height);
    }
  },

  /**
   * Determine the relative height of canvas
   */
  relHeight: {

    /**
     * The aspect ratio `relWidth`:`relHeight` is equal to w:h
     * @return {Number}
     */
    get () {
      const { width, height } = this.canvasElem;
      return height / Math.max(width, height);
    }
  },

  /**
   * TODO FADE_IN_RATE proxy that keeps in between (0.0 - 1.0)
   * _fadeInRate: {}
   */

   /**
    * TODO FADE_OUT_RATE proxy that keeps in between (0.0 - 1.0)
    * _fadeOutRate: {}
    */
};

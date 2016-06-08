/**
 * Determines edge opacity based on if it's fading in
 * @param {Boolean} isFadingIn
 * @param {Object}  edge
 * @type {Function}
 * @return {Number}
 */
export default function getEdgeOpacity (isFadingIn, edge, FADE_IN_RATE, FADE_OUT_RATE) {
  if (isFadingIn) {
    return Math.min(edge.opacity + FADE_IN_RATE, 1);
  } else {
    return Math.max(edge.opacity - FADE_OUT_RATE, 0);
  }
}

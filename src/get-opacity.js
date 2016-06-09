/**
 * Determines input opacity
 * @param {Boolean} isFadingIn
 * @param {Object}  input
 * @param {Number} FADE_IN_RATE
 * @param {Number} FADE_OUT_RATE
 * @type {Method}
 * @private
 * @return {Number}
 */
export default function getOpacity (isFadingIn, input, FADE_IN_RATE = this.FADE_IN_RATE, FADE_OUT_RATE = this.FADE_OUT_RATE) {
  if (isFadingIn) {
    return Math.min(input.opacity + FADE_IN_RATE, 1);
  } else {
    return Math.max(input.opacity - FADE_OUT_RATE, 0);
  }
}

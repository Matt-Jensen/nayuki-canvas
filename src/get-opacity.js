/**
 * Determines input opacity
 * @param {Boolean} isFadingIn
 * @param {Object}  input
 * @param {Number} fadeInRate
 * @param {Number} fadeOutRate
 * @type {Method}
 * @private
 * @return {Number}
 */
export default function getOpacity (isFadingIn, input, fadeInRate = this.fadeInRate, fadeOutRate = this.fadeOutRate) {
  if (isFadingIn) {
    return Math.min(input.opacity + fadeInRate, 1);
  } else {
    return Math.max(input.opacity - fadeOutRate, 0);
  }
}

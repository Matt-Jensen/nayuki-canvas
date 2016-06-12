const toLowerCase = (s) => String.prototype.slice.call(s);

/**
 * Factory that generates a Canvas Background instance
 * @param {Object}   config
 * @type {Function}
 * @return {Object}  HTML5 Canvas gradient instance
 */
export default function canvasBackground ({ width, height, size, gradient, graphics, background }) {
  const isGradentBackground = (background instanceof Array);

  let colorStops;
  if (isGradentBackground) {
    colorStops = background;
  } else {
    colorStops = [background, background]; // fake gradient background
  }

  let canvasGradient;
  if (toLowerCase(gradient) === 'linear') {
    canvasGradient = graphics.createLinearGradient(width / 2, 0, width / 2, height);
  } else {
    canvasGradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2); // default
  }

  // add color stops to gradient
  colorStops.forEach(function (color, index, { length: total }) {
    canvasGradient.addColorStop(index / (total - 1), color);
  });

  return canvasGradient;
}

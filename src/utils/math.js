// polyfill based on: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot
export function mathHypot () {
  if (typeof Math.hypot === 'function') {
    return Math.hypot(...arguments);
  }

  let y = 0;
  const length = arguments.length;

  for (let i = 0; i < length; i++) {
    if (arguments[i] === Infinity || arguments[i] === -Infinity) {
      return Infinity;
    }
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
}

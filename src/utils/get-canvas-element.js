/**
 * Resolve the given value if a Canvas DOM element
 * otherwise resolve relevant error if not
 * @param  {Object} element DOM HTMLElment instance
 * @type   {Function}
 * @return {Object|Boolean}
 */
export default function getCanvasElement (element = {}, _HTMLElement = Function, _jQuery = false) {
  const toLowerCase = (s) => String.prototype.toLowerCase.call(s);

  if (_jQuery && (element instanceof _jQuery) && (typeof element.get === 'function')) {
    element = element.get(0); // use first DOM Element in jQuery object
  }

  // is a DOM Element and has name canvas
  if (element instanceof _HTMLElement === true && toLowerCase(element.nodeName) === 'canvas') {
    return element;
  } else {
    return false;
  }
}

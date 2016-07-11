module.exports = function nayukiQuery (nc) {
  return Object.assign(Object.create({
    colorAt (x, y) {
      const imgData = Array.prototype.slice.call(this._context.getImageData(x, y, 1, 1).data);
      return `rgba(${imgData.join(',')})`;
    }
  }),
  {
    _$: nc,
    _element: nc._canvasElem,
    _context: nc._graphics,
  });
};

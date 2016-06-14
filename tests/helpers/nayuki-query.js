module.exports = function nayukiQuery (nc) {
  return Object.assign(Object.create({
    colorAt (x, y) {
      return `rgba(${this._context.getImageData(x, y, 1, 1).data.join(',')})`;
    }
  }),
  {
    _$: nc,
    _element: nc._canvasElem,
    _context: nc._graphics,
  });
};

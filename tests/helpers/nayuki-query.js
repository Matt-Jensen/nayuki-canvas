module.exports = function nayukiQuery (nc) {
  return Object.assign(Object.create({
    colorAt (x, y) {
      return `rgba(${this._context.getImageData(x, y, 1, 1).data.join(',')})`;
    },

    insertCanvas () {
      document.body.insertBefore(this._element, document.body.firstChild);
      return this;
    },

    removeCanvas () {
      this._element.parentNode.removeChild(this._element);
      return this;
    }
  }),
  {
    _$: nc,
    _element: nc._canvasElem,
    _context: nc._graphics,
  });
};

const makeArray = times => Array.apply(null, { length: times });

module.exports = {
  createNodes (times = 1, conf = {}) {
    return makeArray(times).map(() => {
      return Object.assign({ posX: 1, posY: 1, velX: 1, velY: 1, opacity: 1, radius: 1 }, conf);
    });
  },

  createEdges (times = 1, conf = {}) {
    return makeArray(times).map(() => {
      return Object.assign({ opacity: 0.5, nodeA: { opacity: 0.5 }, nodeB: { opacity: 0.5 } }, conf);
    });
  },

  createCanvas: (function () {
    let id = 0;

    return function (width = 100, height = 100, styles = {}) {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      canvas.setAttribute('id', `canvas-${id++}`);

      Object.keys(styles).forEach(function (style) {
        canvas.style[style] = styles[style];
      });

      return canvas;
    };
  }())
};

const { assign } = require('lodash');

const { create } = Object;

module.exports = function mockGraphics (conf) {
  return assign(create({
    createRadialGradient () {
      return create({
        addColorStop () {}
      });
    },
    createLinearGradient () {
      return create({
        addColorStop () {}
      });
    }
  }), {
    fillStyle: undefined,
    lineWidth: undefined,
    strokeStyle: undefined,
    fillRect () {},
    beginPath () {},
    arc () {},
    fill () {},
    moveTo () {},
    lineTo () {},
    stroke () {}
  },
  conf);
};

module.exports = function mockGraphics (conf) {
  return Object.assign(Object.create({
    createRadialGradient () {
      return Object.create({
        addColorStop () {}
      });
    },
    createLinearGradient () {
      return Object.create({
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

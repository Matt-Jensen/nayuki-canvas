/**
 * Factory that generates a Canvas Background instance
 * @type {Function}
 * @return {Object} (Canvas Background)
 */
export default function canvasBackground (config) {
  const data = Object.assign({
    startColor: '#575E85', // TODO make gradient start color configurable
    stopColor: '#2E3145' // TODO make gradient end color configurable
    //, background: '' // TODO allow single color backgrounds
  }, config);

  return Object.create({ data }, {
    gradient: {
      get () {
        const { width, height, size, graphics, startColor, stopColor } = this.data;
        const gradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2);
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, stopColor);
        return gradient;
      }
    }
  });
}

export default {
  _validatedHex (hex) {
    hex = (`${hex}`).replace('#', '');
    return hex.length === 3 ? hex.split('').reduce((t, s) => t + s + s, '') : hex;
  },

  hexToRGB (hex) {
    const i = parseInt(this._validatedHex(hex), 16);
    return `${(i) >> 16 & 255},${i >> 8 & 255},${i & 255}`;
  }
};

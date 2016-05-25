/* global define */
import nayukiCanvas from './nayuki-canvas';

if (typeof exports === 'object') {
  module.exports = nayukiCanvas;
} else if (typeof define === 'function' && typeof define.amd !== 'undefined') {
  define(function () { return nayukiCanvas; });
} else if (window && !window.nayukiCanvas) {
  window.nayukiCanvas = nayukiCanvas;
}

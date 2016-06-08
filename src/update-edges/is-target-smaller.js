/**
 * Compares a target's array length to another array length
 * @param {Array}   target
 * @param {Array}   goal
 * @param {Number}  addLength
 * @type {Function}
 * @return {Boolean}
 */
export default function isTargetSmaller (target, goal, addLength = 0) {
  return function () {
    return target.length < goal.length - 1 + addLength;
  };
}

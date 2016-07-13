export function isObject (target) {
  return (typeof target === 'object') && (target instanceof Array === false);
}

// polyfill based on: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
export default function objectAssign (target) {
  if (typeof Object.assign === 'function') {
    return Object.assign(...arguments);
  }

  if (!isObject(target)) {
    throw new Error('Cannot perform assign on non-object');
  }

  for (let index = 1; index < arguments.length; index++) {
    const source = arguments[index];

    if (isObject(source)) {
      for (let key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  }

  return target;
}

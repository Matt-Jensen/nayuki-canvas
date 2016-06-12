/**
 * Determines if Nayuki Canvas is supported in the current environment
 * @type {Function}
 * @return {Boolean}
 */
export default function isSupported () {
  const elem = (
    typeof document === 'object' &&
    document.createElement &&
    document.createElement('canvas')
  );
  return !!(elem && elem.getContext && elem.getContext('2d'));
}

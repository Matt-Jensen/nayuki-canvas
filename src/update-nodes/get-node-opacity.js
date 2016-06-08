export default function getNodeOpacity (isFadingOut, opacity, FADE_IN_RATE, FADE_OUT_RATE) {
  if (isFadingOut) {
    return Math.max(opacity - FADE_OUT_RATE, 0);
  } else { // Fade in ones otherwise
    return Math.min(opacity + FADE_IN_RATE, 1);
  }
}

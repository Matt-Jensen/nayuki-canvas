/**
 * Dispurse nodes/edges instead of fade in
 * @type {Method}
 * @return {Object}  Canvas instance
 */
export default function initialize () {

  // Spread out nodes to avoid ugly clumping
  for (let i = 0; i < 70; i++) {
    this.next();
  }

  return this; // allow chaining
}

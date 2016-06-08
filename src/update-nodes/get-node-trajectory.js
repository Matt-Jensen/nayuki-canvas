/**
 * Creates a new trajectory object from a given node and drift speed
 * @param  {Object} node
 * @param  {Number} driftSpeed
 * @return {Object} trajectory
 */
export default function getNodeTrajectory ({ posX, posY, velX, velY }, driftSpeed) {
  return {
    // Move based on velocity
    posX: posX + (velX * driftSpeed),
    posY: posY + (velY * driftSpeed),

    // Randomly perturb velocity, with damping
    velX: velX * 0.99 + (Math.random() - 0.5) * 0.3,
    velY: velY * 0.99 + (Math.random() - 0.5) * 0.3
  };
}

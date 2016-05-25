/*
* Updates the position of each node in the given array (in place), based on
* their existing positions. Returns nothing. No other side effects.
*/
export default function doForceField () {
  let i = 0;
  const deltas = [];
  const { repulsionForce, nodes } = this;

  for (i = 0; i < nodes.length * 2; i++) {
    deltas.push(0.0);
  }

  // For simplicitly, we perturb positions directly, instead of velocities
  for (i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];

    for (let j = 0; j < i; j++) {
      const nodeB = nodes[j];
      let dx = nodeA.posX - nodeB.posX;
      let dy = nodeA.posY - nodeB.posY;
      const distSqr = dx * dx + dy * dy;

      // Notes: The factor 1/sqrt(distSqr) is to make (dx, dy) into a unit vector.
      // 1/distSqr is the inverse square law, with a smoothing constant added to prevent singularity.
      const factor = repulsionForce / (Math.sqrt(distSqr) * (distSqr + 0.00001));
      dx *= factor;
      dy *= factor;
      deltas[i * 2 + 0] += dx;
      deltas[i * 2 + 1] += dy;
      deltas[j * 2 + 0] -= dx;
      deltas[j * 2 + 1] -= dy;
    }
  }

  for (i = 0; i < nodes.length; i++) {
    nodes[i].posX += deltas[i * 2 + 0];
    nodes[i].posY += deltas[i * 2 + 1];
  }
}

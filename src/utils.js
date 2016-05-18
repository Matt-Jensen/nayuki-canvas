// Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
export function calcAllEdgeWeights(nodes) {
  // Each entry has the form [weight, nodeAIndex, nodeBIndex], where nodeAIndex < nodeBIndex
  const result = [];

  for (let i = 0; i < nodes.length; i++) {  // Calculate all n * (n - 1) / 2 edges
    const nodeA = nodes[i];

    for (let j = 0; j < i; j++) {
      const nodeB = nodes[j];
      let weight = Math.hypot(nodeA.posX - nodeB.posX, nodeA.posY - nodeB.posY);  // Euclidean distance
      weight /= Math.pow(nodeA.radius * nodeB.radius, radiiWeightPower);  // Give discount based on node radii
      result.push([weight, i, j]);
    }
  }

  // Sort array by ascending weight
  result.sort((a, b) => {
    const [x] = a;
    const [y] = b;
    return x < y ? -1 : (x > y ? 1 : 0);
  });

  return result;
}

// Returns a new array of edge objects that is a minimal spanning tree on the given set
// of nodes, with edges in ascending order of weight. Note that the returned edge objects
// are missing the opacity property. Pure function, no side effects.
export function calcSpanningTree(allEdges, nodes) {

  // Kruskal's MST algorithm
  const result = [];
  const ds = new DisjointSet(nodes.length);

  for (let i = 0; i < allEdges.length && result.length < nodes.length - 1; i++) {
    const edge = allEdges[i];
    const j = edge[1];
    const k = edge[2];

    if (ds.mergeSets(j, k)) {
      result.push({nodeA:nodes[j], nodeB:nodes[k]});
    }
  }

  return result;
}

// Tests whether the given array of edge objects contains an edge with
// the given endpoints (undirected). Pure function, no side effects.
export function containsEdge(array, edge) {
  for (let i = 0; i < array.length; i++) {
    const elem = array[i];
    if (elem.nodeA == edge.nodeA && elem.nodeB == edge.nodeB || elem.nodeA == edge.nodeB && elem.nodeB == edge.nodeA) {
      return true;
    }
  }
  return false;
}


// Updates the position of each node in the given array (in place), based on
// their existing positions. Returns nothing. No other side effects.
export function doForceField(nodes) {
  let i = 0;
  const deltas = [];

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

// Returns a new array of edges by reading the given array of nodes and by updating/adding/removing edges
// based on the other given array. Although both argument arrays and nodes are unmodified,
// the edge objects themselves are modified. No other side effects.
export function updateEdges(nodes, edges) {
  let i = 0;

  // Calculate array of spanning tree edges, then add some extra low-weight edges
  let allEdges = calcAllEdgeWeights(nodes)
  const idealEdges = calcSpanningTree(allEdges, nodes);

  for (i = 0; i < allEdges.length && idealEdges.length < nodes.length - 1 + maxExtraEdges; i++) {
    const edge = { nodeA:nodes[allEdges[i][1]], nodeB:nodes[allEdges[i][2]] };  // Convert data formats
    if (!containsEdge(idealEdges, edge)) {
      idealEdges.push(edge);
    }
  }
  allEdges = null;  // Let this big array become garbage sooner

  // Classify each current edge, checking whether it is in the ideal set; prune faded edges
  const newEdges = [];
  edges.forEach(function(edge) {
    if (containsEdge(idealEdges, edge)) {
      edge.opacity = Math.min(edge.opacity + FADE_IN_RATE, 1);
    } else {
      edge.opacity = Math.max(edge.opacity - FADE_OUT_RATE, 0);
    }
    if (edge.opacity > 0 && edge.nodeA.opacity > 0 && edge.nodeB.opacity > 0) {
      newEdges.push(edge);
    }
  });

  // If there is room for new edges, add some missing spanning tree edges (higher priority), then extra edges
  for (i = 0; i < idealEdges.length && newEdges.length < nodes.length - 1 + maxExtraEdges; i++) {
    const edge = idealEdges[i];
    if (!containsEdge(newEdges, edge)) {
      edge.opacity = 0.0;  // Add missing property
      newEdges.push(edge);
    }
  }

  return newEdges;
}

// Redraws the canvas based on the given values. No other side effects.
export function redrawCanvas(canvasElem, graphics, nodes, edges) {

  // Get pixel dimensions
  const { width, height } = canvasElem;
  const size = Math.max(width, height);

  // Draw background gradient to overwrite everything
  const gradient = graphics.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, size / 2);
  gradient.addColorStop(0.0, '#575E85');
  gradient.addColorStop(1.0, '#2E3145');
  graphics.fillStyle = gradient;
  graphics.fillRect(0, 0, width, height);

  // Draw every node
  nodes.forEach((node) => {
    graphics.fillStyle = `rgba(129,139,197,${node.opacity.toFixed(3)})`;
    graphics.beginPath();
    graphics.arc(node.posX * size, node.posY * size, node.radius * size, 0, Math.PI * 2);
    graphics.fill();
  });

  // Draw every edge
  graphics.lineWidth = size / 800;
  edges.forEach((edge) => {
    const { nodeA, nodeB } = edge;
    let dx = nodeA.posX - nodeB.posX;
    let dy = nodeA.posY - nodeB.posY;
    const mag = Math.hypot(dx, dy);

    if (mag > nodeA.radius + nodeB.radius) {  // Draw edge only if circles don't intersect
      dx /= mag;  // Make (dx, dy) a unit vector, pointing from B to A
      dy /= mag;

      const opacity = Math.min(Math.min(nodeA.opacity, nodeB.opacity), edge.opacity);
      graphics.strokeStyle = `rgba(129,139,197,${opacity.toFixed(3)})`;
      graphics.beginPath();

      // Shorten the edge so that it only touches the circumference of each circle
      graphics.moveTo((nodeA.posX - dx * nodeA.radius) * size, (nodeA.posY - dy * nodeA.radius) * size);
      graphics.lineTo((nodeB.posX + dx * nodeB.radius) * size, (nodeB.posY + dy * nodeB.radius) * size);
      graphics.stroke();
    }
  });
}

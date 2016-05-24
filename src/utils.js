import DisjointSet from './disjoint-set'

// Tests whether the given array of edge objects contains an edge with
// the given endpoints (undirected). Pure function, no side effects.
export function containsEdge(array, edge) {
  for (let i = 0; i < array.length; i++) {
    const elem = array[i]
    if (elem.nodeA == edge.nodeA && elem.nodeB == edge.nodeB || elem.nodeA == edge.nodeB && elem.nodeB == edge.nodeA) {
      return true
    }
  }
  return false
}


// Returns a new array of edge objects that is a minimal spanning tree on the given set
// of nodes, with edges in ascending order of weight. Note that the returned edge objects
// are missing the opacity property. Pure function, no side effects.
export function calcSpanningTree(allEdges, nodes) {

  // Kruskal's MST algorithm
  const result = []
  const ds = new DisjointSet(nodes.length)

  for (let i = 0; i < allEdges.length && result.length < nodes.length - 1; i++) {
    const edge = allEdges[i]
    const j = edge[1]
    const k = edge[2]

    if (ds.mergeSets(j, k)) {
      result.push({ nodeA: nodes[j], nodeB: nodes[k] })
    }
  }

  return result
}

// Returns a sorted array of edges with weights, for all unique edge pairs. Pure function, no side effects.
export function calcAllEdgeWeights(nodes, radiiWeightPower) {

  // Each entry has the form [weight, nodeAIndex, nodeBIndex], where nodeAIndex < nodeBIndex
  const result = []

  for (let i = 0; i < nodes.length; i++) {  // Calculate all n * (n - 1) / 2 edges
    const nodeA = nodes[i]

    for (let j = 0; j < i; j++) {
      const nodeB = nodes[j]
      let weight = Math.hypot(nodeA.posX - nodeB.posX, nodeA.posY - nodeB.posY)  // Euclidean distance
      weight /= Math.pow(nodeA.radius * nodeB.radius, radiiWeightPower)  // Give discount based on node radii
      result.push([weight, i, j])
    }
  }

  // Sort array by ascending weight
  result.sort((a, b) => {
    const [x] = a
    const [y] = b
    return x < y ? -1 : (x > y ? 1 : 0)
  });

  return result
}

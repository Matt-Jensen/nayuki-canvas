// Populate initial nodes and edges, then improve on them
export default function initialize () {
  this.stepFrame();  // Generate nodes
  for (let i = 0; i < 300; i++) {  // Spread out nodes to avoid ugly clumping
    this.doForceField();
  }
  this.edges = [];
  this.stepFrame();  // Redo spanning tree and extra edges because nodes have moved

  // Make everything render immediately instead of fading in
  this.nodes.concat(this.edges).forEach(function (item) {  // Duck typing
    item.opacity = 1;
  });

  this.redrawCanvas();
}

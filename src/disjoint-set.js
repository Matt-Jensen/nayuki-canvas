// The union-find data structure. A heavily stripped-down version derived from https://www.nayuki.io/page/disjoint-set-data-structure .
export default function DisjointSet(size) {
  const parents = [];
  const ranks = [];

  for (let i = 0; i < size; i++) {
    parents.push(i);
    ranks.push(0);
  }

  function getRepr(i) {
    if (parents[i] != i) {
      parents[i] = getRepr(parents[i]);
    }
    return parents[i];
  }

  this.mergeSets = function(i, j) {
    const repr0 = getRepr(i);
    const repr1 = getRepr(j);

    if (repr0 == repr1) {
      return false;
    }

    const cmp = ranks[repr0] - ranks[repr1];
    if (cmp >= 0) {
      if (cmp == 0) {
        ranks[repr0]++;
      }
      parents[repr1] = repr0;
    } else {
      parents[repr0] = repr1;
    }

    return true;
  };
}

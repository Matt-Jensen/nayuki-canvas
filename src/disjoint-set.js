const prototype = {
  getRepr (i) {
    if (this.parents[i] !== i) {
      this.parents[i] = this.getRepr(this.parents[i]);
    }
    return this.parents[i];
  },

  mergeSets (i, j) {
    const repr0 = this.getRepr(i);
    const repr1 = this.getRepr(j);

    if (repr0 === repr1) {
      return false;
    }

    const cmp = this.ranks[repr0] - this.ranks[repr1];
    if (cmp >= 0) {
      if (cmp === 0) {
        this.ranks[repr0]++;
      }
      this.parents[repr1] = repr0;
    } else {
      this.parents[repr0] = repr1;
    }

    return true;
  }
};

/**
 * The union-find data structure.
 * A lite version of https://www.nayuki.io/page/disjoint-set-data-structure
 * @param  {Number} size
 * @type   {Function}
 * @return {Object}
 */
export default function disjointSet (size) {
  const instance = {
    parents: { value: [] },
    ranks: { value: [], writable: true }
  };

  for (let i = 0; i < size; i++) {
    instance.parents.value.push(i);
    instance.ranks.value.push(0);
  }

  return Object.create(prototype, instance);
}

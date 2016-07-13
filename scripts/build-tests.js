const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const getJsPaths = require('./utils/get-js-paths');

getJsPaths('src')
.then(function (paths) {
  return Promise.all(paths.map(p => {
    return rollup.rollup({
      entry: p,
      plugins: [
        babel({
          babelrc: false,
          presets: ['es2015-rollup'],
          plugins: ['transform-object-assign']
        })
      ]
    });
  }))
  .then(function (bundles) {
    return paths.map(p => ({
      path: p.replace('src/', 'tmp/'),
      bundle: bundles.shift()
    }));
  });
})
.then(function (bundles) {
  return bundles.map(file => file.bundle.write({
    dest: file.path,
    format: 'cjs'
  }));
})
.catch(console.error);

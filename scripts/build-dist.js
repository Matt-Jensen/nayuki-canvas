const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const pkg = require('../package.json');
const mainDest = `${__dirname}/../dist/${pkg.name}`
const configs = [
  {
    dest: `${mainDest}.js`,
    plugins: [
      babel({
        babelrc: false,
        presets: ['es2015-rollup']
      })
    ]
  },
  {
    dest: `${mainDest}.min.js`,
    plugins: [
      babel({
        babelrc: false,
        presets: ['es2015-rollup']
      }),
      uglify()
    ]
  }
];

// Generate distros
for (let config of configs) {

  let { dest, plugins } = config;

  rollup.rollup({
    entry: `${__dirname}/../src/index.js`,
    plugins
  })
  .then(bundle => {
    bundle.write({
      dest,
      format: 'iife',
      moduleName: 'nayukiCanvas'
    });
  })
  .catch(console.error);
}

const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const getJsPaths = require('./get-js-paths')

getJsPaths('src')
.then(function(paths) {
  return Promise.all(paths.map(p => {
    return rollup.rollup({
      entry: p,
      plugins: [
        babel({
          babelrc: false,
          presets: ['es2015-rollup']
        })
      ]
    })
  }))
  .then(function(bundles) {
    return paths.map(p => {
      return {
        path: p.replace('src/', 'tmp/'),
        bundle: bundles.shift()
      }
    })
  })
})
.then(function(bundles) {
  bundles.map(function(file) {
    return file.bundle.write({
      dest: file.path,
      format: 'cjs'
    })
  })
})
.catch(console.error)

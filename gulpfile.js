const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-rollup');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const util = require('gulp-util');
const jscs = require('gulp-jscs');
const watch = require('gulp-watch');
const livereload = require('gulp-livereload');
const plumber = require('gulp-plumber');
const print = require('gulp-print');
const uglify = require('gulp-uglify');
const tape = require('gulp-tape');
const tapColorize = require('tap-colorize');

gulp.task('watch', function() {
  watch('./src/**/*.js', compile);
  return compile();
})

gulp.task('lint', lint);

gulp.task('test', function() {
  return gulp.src('./tests/*.js')
  .pipe(tape({
    reporter: tapColorize()
  }));
})

gulp.task('default', ['watch'])

function compile() {
  gulp.src('./src/index.js')
  .pipe(print(function(filepath) {
    return 'built: ' + filepath
  }))
  .pipe(plumber({
    errorHandler: function(err) {
      console.log(err.message)
      this.emit('end')
    }
  }))
  .pipe(rollup({
    sourceMap: true
  }))
  .pipe(babel())
  .on('error', util.log)
  .pipe(rename('nayuki-canvas.js'))
  .pipe(gulp.dest('./dist'))
  .pipe(uglify())
  .pipe(rename('nayuki-canvas.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./dist'))
  .pipe(livereload({ start: true }))
}

function lint() {
  return gulp.src(['./src/*.js', './tests/*.js'])
  .pipe(jscs({ fix: true, configPath: '.jscsrc' }))
  .pipe(jscs.reporter())
}

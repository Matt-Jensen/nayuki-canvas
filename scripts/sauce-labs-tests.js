// TODO requires an open souce account

const Runner = require('sauce-tap-runner');
const browserify = require('browserify');
const co = require('co');
require('dotenv').config();

const tests = new Runner(process.env.SAUCE_USER, process.env.SAUCE_KEY);

const src = browserify(`${__dirname}/../tests/end-to-end/nayuki-canvas.e2e.js`)
  .transform('babelify', { presets: ['es2015'] })
  .bundle();

const run = function run (config) {

  // Return Promise that when called will run tests in specified browser
  return new Promise(function (resolve, reject) {
    tests.run(src, config, function (err, results) {
      if (err) {
        return reject(err);
      }

      resolve(results);
    });
  });
};

co(function* () {
  const results = {};
  results.chrome = yield run({ browserName: 'chrome', version: 'latest', platform: 'Windows 8.1' });
  results.firefox = yield run({ browserName: 'firefox', version: 'latest', platform: 'Windows 8.1' });
  results.safari = yield run({ browserName: 'safari', version: 'latest', platform: 'OS X 10.11', });
  results.ie9 = yield run({ browserName: 'internet explorer', version: '9.0', platform: 'Windows 7'});
  results.ie11 = yield run({ browserName: 'internet explorer', version: '11.0', platform: 'Windows 7'});
  results.edge = yield run({ browserName: 'MicrosoftEdge', version: 'latest', platform: 'Windows 10'});
  return results;
})
.then(results => console.log('Tests completed', results))
.catch(err => console.error(err))
.then(function () {
  tests.close(function () {
    // Runner is closed
  });
});

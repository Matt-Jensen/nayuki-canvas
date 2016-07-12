const Runner = require('sauce-tap-runner');
const browserify = require('browserify');
const co = require('co');
require('dotenv').config();

const src = browserify(`${__dirname}/../tests/end-to-end/nayuki-canvas.e2e.js`)
  .transform('babelify', { presets: ['es2015'] })
  .bundle();

const run = function run (config) {
  // Return Promise that when called will run tests in specified browser
  return new Promise(function (resolve, reject) {
    const tests = new Runner(process.env.SAUCE_USER, process.env.SAUCE_KEY);

    tests.run(src, config, function (err, results) {
      tests.close(function () {
        if (err) {
          console.log(`Tests failed for: ${config.browserName}`, err);
          return reject(err);
        }

        console.log(`Tests successful for: ${config.browserName}`);
        resolve(results);
      });
    });
  });
};

co(function* () {
  yield run({ browserName: 'chrome', version: 'latest', platform: 'Windows 8.1' });
  yield run({ browserName: 'firefox', version: 'latest', platform: 'Windows 8.1' });
  yield run({ browserName: 'safari', version: 'latest', platform: 'OS X 10.11' });
  yield run({ browserName: 'internet explorer', version: '9.0', platform: 'Windows 7' }); // Selenium errors
  yield run({ browserName: 'internet explorer', version: '11.0', platform: 'Windows 7' }); // Selenium errors
  yield run({ browserName: 'MicrosoftEdge', version: 'latest', platform: 'Windows 10' });
});

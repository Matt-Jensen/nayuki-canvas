const browserify = require('browserify');
const tapeRun = require('tape-run');
const co = require('co');

function createTestStream () {
  return browserify(`${__dirname}/../tests/end-to-end/nayuki-canvas.e2e.js`).transform('babelify', { presets: ['es2015'] }).bundle();
}

function tapeOutput (config) {
  return new Promise(function (resolve) {
    const tap = createTestStream().pipe(tapeRun(config));
    const chunks = [];

    chunks.push(`----- ${config.browser.toUpperCase()} -----\n`);

    tap.on('data', function (chunk) {
      chunks.push(chunk);
    });

    tap.on('results', function () {
      resolve(chunks.join(''));
    });
  });
}

co(function* () {
  const chrome = yield tapeOutput({ browser: 'chrome' });
  const firefox = yield tapeOutput({ browser: 'firefox' });
  const safari = yield tapeOutput({ browser: 'safari' });
  return [chrome, firefox, safari].join('');
})
.then(function (result) {
  return process.stdout.write(result);
})
.catch(function (err) {
  console.error(err);
});

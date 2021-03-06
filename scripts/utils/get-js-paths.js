const fs = require('fs');

module.exports = function getJsPaths (target) {
  return new Promise((resolve, reject) => {
    fs.readdir(target, function (err, files) {
      files = files.filter(f => f[0] !== '.'); // ignore system files

      if (err) {
        reject(err);
      }

      const list = [];

      for (let file of files) {
        if (file.search('.js') === -1) {
          list.push(getJsPaths(`${target}/${file}`));
        } else {
          list.push(`${target}/${file}`);
        }
      }

      Promise.all(list)
      .then(function (result) {
        resolve([].concat.apply([], result));
      });
    });
  });
};

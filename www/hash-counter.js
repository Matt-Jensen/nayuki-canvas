(function () {
  var hash = document.location.hash.replace('#', '');
  hash = parseInt(hash, 10);
  hash = isNaN(hash) ? 0 : hash;
  document.location.hash = hash + 1 + '';
}());

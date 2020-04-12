var fs = require('fs'),
  path = require('path'),
  files = fs.readdirSync(__dirname);

files.forEach(function(file) {
  var file_name = file.match(/(.*).js/)[1],
    file_path = path.join(__dirname, file);

  if (file_name === 'index') {
    return;
  }

  module.exports[file_name] = require(file_path);
});

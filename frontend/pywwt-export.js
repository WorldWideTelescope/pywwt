// Export build artifacts from the pywwt JavaScript frontend code to the pywwt
// Python package.

var shell = require('shelljs');

shell.cp('dist/bundle.js', '../pywwt/nbextension/static/index.js');
shell.cp('dist/bundle.js.map', '../pywwt/nbextension/static/index.js.map');

shell.rm('-rf', '../pywwt/labextension');
shell.mkdir('-p', '../pywwt/labextension');
shell.cp('pywwt-*.tgz', '../pywwt/labextension/');

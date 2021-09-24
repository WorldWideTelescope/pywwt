// Export build artifacts from the pywwt JavaScript frontend code to the pywwt
// Python package.

var shell = require('shelljs');

shell.mkdir('-p', '../pywwt/nbextension/static');
shell.cp('dist/bundle.js', '../pywwt/nbextension/static/index.js');
shell.cp('dist/bundle.js.map', '../pywwt/nbextension/static/index.js.map');

shell.rm('-rf', '../pywwt/web_static/research');
shell.mkdir('-p', '../pywwt/web_static/research');
shell.cp('-r', 'node_modules/@wwtelescope/research-app/dist/*', '../pywwt/web_static/research');

shell.rm('-rf', '../pywwt/labextension');
shell.mkdir('-p', '../pywwt/labextension');
shell.cp('pywwt-*.tgz', '../pywwt/labextension/');

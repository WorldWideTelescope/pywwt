// Copyright 2021 the .NET Foundation
// Licensed under the three-clause BSD License

// This is the main index file for the pywwt Jupyter Widget frontend JavaScript
// module. `widget.js` contains the main ipywidgets implementation, and
// `jupyterlab.js` includes the JupyterLab extension shims needed to make the
// widget available in the JupyterLab environment. `jupyterlab.js` isn't
// imported here, but the `package.json` contains metadata telling the
// JupyterLab extension manager to load up that file.

module.exports = require('./widget.js');
module.exports['version'] = require('../package.json').version;

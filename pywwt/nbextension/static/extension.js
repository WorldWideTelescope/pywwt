+// This file contains the Javascript that implements the Jupyter notebook
+// extension, as linked up in `pywwt/nbextension/__init__.py` with the `require`
+// keyword.
+//
+// It contains some requirejs configuration and the `load_ipython_extension`
+// which is required for any notebook extension.

define(function() {
    "use strict";

    window['requirejs'].config({
        map: {
            '*': {
                'pywwt': 'nbextensions/pywwt/index',
            },
        }
    });

    // Export the required load_ipython_extention
    return {
        load_ipython_extension : function() {}
    };
});

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

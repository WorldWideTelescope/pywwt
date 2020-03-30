def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'nbextension/static',
        'dest': 'pywwt',
        'require': 'pywwt/extension'
    }]

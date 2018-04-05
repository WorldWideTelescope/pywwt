import sys

from jupyterlab.commands import get_app_info
from notebook.nbextensions import validate_nbextension
from notebook.serverextensions import validate_serverextension

if validate_nbextension('pywwt/extension') != []:
    print("Issue detected with nbextension")
    sys.exit(1)

info = get_app_info()

if 'pywwt' not in info['extensions'] or 'pywwt' in info['disabled']:
    print("Issue detected with labextension")
    sys.exit(1)

if validate_serverextension('pywwt') != []:
    print("Issue detected with serverextension")
    sys.exit(1)

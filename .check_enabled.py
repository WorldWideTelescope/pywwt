import logging
import sys

from jupyterlab.commands import get_app_info

try:
    from nbclassic.nbextensions import validate_nbextension
except ImportError:
    # `notebook` <= 6
    from notebook.nbextensions import validate_nbextension

try:
    from nbclassic.serverextensions import validate_serverextension
except ImportError:
    # `notebook` <= 6
    from notebook.serverextensions import validate_serverextension

# If there's a problem and we don't provide this, the validate function crashes :-(
logger = logging.getLogger("")

if validate_nbextension("pywwt/extension", logger=logger) != []:
    print("Issue detected with nbextension")
    sys.exit(1)

info = get_app_info()

if "pywwt" not in info["extensions"] or "pywwt" in info["disabled"]:
    print("Issue detected with labextension")
    sys.exit(1)

if validate_serverextension("pywwt", logger=logger) != []:
    print("Issue detected with serverextension")
    sys.exit(1)

@echo off

"%PREFIX%\Scripts\jupyter-nbextension.exe" enable widgetsnbextension --py --sys-prefix > NUL 2>&1 && if errorlevel 1 exit 1
"%PREFIX%\Scripts\jupyter-labextension.exe" enable @jupyter-widgets/jupyterlab-manager --py --sys-prefix > NUL 2>&1 && if errorlevel 1 exit 1

"${PREFIX}/bin/jupyter-nbextension" enable widgetsnbextension --py --sys-prefix >> $PREFIX/.messages.txt 2>&1
"${PREFIX}/bin/jupyter-labextension" enable @jupyter-widgets/jupyterlab-manager --py --sys-prefix >> $PREFIX/.messages.txt 2>&1


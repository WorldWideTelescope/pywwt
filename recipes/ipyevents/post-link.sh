"${PREFIX}/bin/jupyter-nbextension" enable widgetsnbextension --py --sys-prefix >> $PREFIX/.messages.txt 2>&1
"${PREFIX}/bin/jupyter-nbextension" enable ipyevents --py --sys-prefix >> $PREFIX/.messages.txt 2>&1

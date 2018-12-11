from qtpy import QtWidgets

app = None

def get_qapp():
    global app
    if app is None:
        app = QtWidgets.QApplication.instance()
        if app is None:
            app = QtWidgets.QApplication([''])
    return app

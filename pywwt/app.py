from qtpy import QtWidgets

__all__ = ['get_qapp', 'cleanup_qapp']

app = None


def get_qapp():
    global app
    if app is None:
        app = QtWidgets.QApplication.instance()
        if app is None:
            app = QtWidgets.QApplication([''])
    return app


def cleanup_qapp():
    global app
    if app is not None:
        app.exit()
        app = None

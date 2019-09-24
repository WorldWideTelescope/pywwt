# This file contains the defintion of the Qt widget. Most of the code here
# deals with differences between WebEngine and WebKit (either of which may be
# available in Qt) and also deals with figuring out how we know once WWT is
# set up.

from __future__ import absolute_import, division, print_function

import os
import json
import time

from qtpy.QtWebEngineWidgets import QWebEngineView, QWebEnginePage, WEBENGINE
from qtpy import QtWidgets, QtGui, QtCore

from .app import get_qapp
from .core import BaseWWTWidget
from .logger import logger
from .data_server import get_data_server

__all__ = ['WWTQtClient']

WWT_JSON_FILE = os.path.join(os.path.dirname(__file__), 'nbextension', 'static', 'wwt_json_api.js')

with open(WWT_JSON_FILE) as f:
    WWT_JSON = f.read()

WWT_HTML_FILE = os.path.join(os.path.dirname(__file__), 'nbextension', 'static', 'wwt.html')

with open(WWT_HTML_FILE) as f:
    WWT_HTML = f.read()


class WWTWebEngineView(QWebEngineView):

    # Pass drag and drop events back up to the parent
    # as this is needed for cases where applications
    # embed a PyWWT Qt widget.

    def dragEnterEvent(self, event):
        if self.parent() is None:
            super(WWTWebEngineView, self).dragEnterEvent(event)
        else:
            return self.parent().dragEnterEvent(event)

    def dragMoveEvent(self, event):
        if self.parent() is None:
            super(WWTWebEngineView, self).dragMoveEvent(event)
        else:
            return self.parent().dragMoveEvent(event)

    def dragLeaveEvent(self, event):
        if self.parent() is None:
            super(WWTWebEngineView, self).dragLeaveEvent(event)
        else:
            return self.parent().dragLeaveEvent(event)

    def dropEvent(self, event):
        if self.parent() is None:
            super(WWTWebEngineView, self).dropEvent(event)
        else:
            return self.parent().dropEvent(event)


class WWTQWebEnginePage(QWebEnginePage):
    """
    Subclass of QWebEnginePage that can check when WWT is ready for
    commands.
    """

    wwt_ready = QtCore.Signal()

    def __init__(self, parent=None):
        super(WWTQWebEnginePage, self).__init__(parent=parent)
        self._timer = QtCore.QTimer()
        self._timer.timeout.connect(self._check_ready)
        self._timer.start(500)
        self._check_running = False
        if not WEBENGINE:
            self._frame = self.mainFrame()

    if WEBENGINE:

        def _wwt_ready_callback(self, result):
            if result == 1:
                self._timer.stop()
                self.wwt_ready.emit()
            self._check_running = False

        def javaScriptConsoleMessage(self, level=None, message=None,
                                     line_number=None, source_id=None):
            if not self._check_running or 'wwt_ready' not in message:
                print('{0} (level={1}, line_number={2}, source_id={3})'.format(message, level, line_number, source_id))

        def _check_ready(self):
            if not self._check_running:
                self._check_running = True
                super(WWTQWebEnginePage, self).runJavaScript('wwt_ready;', self._wwt_ready_callback)

        def _process_js_response(self, result):
            self._js_response_received = True
            self._js_response = result

        def runJavaScript(self, code, asynchronous=True):
            app = get_qapp()
            if asynchronous:
                super(WWTQWebEnginePage, self).runJavaScript(code)
            else:
                self._js_response_received = False
                self._js_response = None
                super(WWTQWebEnginePage, self).runJavaScript(code, self._process_js_response)
                while not self._js_response_received:
                    app.processEvents()
                return self._js_response

    else:

        def javaScriptConsoleMessage(self, message=None, line_number=None,
                                     source_id=None):
            if 'wwt_ready' not in message:
                print('{0} (line_number={1}, source_id={2})'.format(message, line_number, source_id))

        def runJavaScript(self, code, asynchronous=False):
            return self._frame.evaluateJavaScript(code)

        def _check_ready(self):
            result = self.runJavaScript('wwt_ready;')
            if result == 1:
                self._timer.stop()
                self.wwt_ready.emit()


class WWTQtWidget(QtWidgets.QWidget):

    def __init__(self, url=None, parent=None):

        super(WWTQtWidget, self).__init__(parent=parent)

        self.web = WWTWebEngineView()
        self.page = WWTQWebEnginePage()
        self.page.setView(self.web)
        self.web.setPage(self.page)
        self.web.setUrl(QtCore.QUrl(url))

        layout = QtWidgets.QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        self.setLayout(layout)
        layout.addWidget(self.web)

        self._wwt_ready = False
        self._js_queue = ""

        self.page.wwt_ready.connect(self._on_wwt_ready)

    def send_msg(self, **kwargs):
        msg = json.dumps(kwargs)
        return self._run_js("wwt_apply_json_message(wwt, {0})".format(msg))

    def _on_wwt_ready(self):
        self._run_js(WWT_JSON)
        self._wwt_ready = True
        self._run_js(self._js_queue, asynchronous=True)
        self._js_queue = ""

    def _run_js(self, js, asynchronous=True):
        if not js:
            return
        if self._wwt_ready:
            logger.debug('Running javascript: %s' % js)
            return self.page.runJavaScript(js, asynchronous=asynchronous)
        else:
            logger.debug('Caching javascript: %s' % js)
            self._js_queue += js + '\n'

    def dragEnterEvent(self, event):
        if self.parent() is None:
            super(WWTQtWidget, self).dragEnterEvent(event)
        else:
            return self.parent().dragEnterEvent(event)

    def dragMoveEvent(self, event):
        if self.parent() is None:
            super(WWTQtWidget, self).dragMoveEvent(event)
        else:
            return self.parent().dragMoveEvent(event)

    def dragLeaveEvent(self, event):
        if self.parent() is None:
            super(WWTQtWidget, self).dragLeaveEvent(event)
        else:
            return self.parent().dragLeaveEvent(event)

    def dropEvent(self, event):
        if self.parent() is None:
            super(WWTQtWidget, self).dropEvent(event)
        else:
            return self.parent().dropEvent(event)


class WWTQtClient(BaseWWTWidget):
    """
    A client to create and drive the Qt widget.

    Parameters
    ----------
    block_until_ready : `bool`
        Tells Python to wait for WorldWide Telescope to open before
        proceeding with any following script (default: `True`).

    size : `tuple`
        Sets size of widget in pixels (default: (600, 600)).
    """

    def __init__(self, block_until_ready=False, size=None):

        app = get_qapp()

        self._data_server = get_data_server()
        self._data_server.serve_file(WWT_JSON_FILE, real_name=True)
        wwt_url = self._data_server.serve_file(WWT_HTML_FILE, real_name=True)

        self.widget = WWTQtWidget(url=wwt_url)
        if size is not None:
            self.widget.resize(*size)
        self.widget.show()

        super(WWTQtClient, self).__init__()

        if block_until_ready:
            while True:
                app.processEvents()
                if self.widget._wwt_ready:
                    break

    def wait(self, duration=None):
        """
        Prevents WorldWide Telescope from closing once Python reaches the
        end of a given script.

        Parameters
        ----------
        duration : int or float or None
            How many seconds to wait for. By default, this waits until the
            Qt window is closed.
        """
        app = get_qapp()
        if duration is None:
            app.exec_()
        else:
            time1 = time.time()
            while time.time() - time1 < duration:
                app.processEvents()

    def _send_msg(self, asynchronous=True, **kwargs):
        msg = json.dumps(kwargs)
        return self.widget._run_js("wwt_apply_json_message(wwt, {0});".format(msg), asynchronous=asynchronous)

    def _get_view_data(self, field):
        if field in ['ra', 'dec', 'fov', 'datetime']:
            return self._send_msg(event='get_'+field, asynchronous=False)
        else:
            raise ValueError("'field' should be one of: 'ra', 'dec', "
                             "'fov', or 'datetime'")

    def _serve_file(self, filename, extension=''):
        return self._data_server.serve_file(filename, extension=extension)

    def render(self, filename):
        """
        Saves a screenshot of the viewer's current state.

        Parameters
        ----------
        filename : `str`
            The desired name of the image file to be saved.
        """
        image = QtGui.QImage(self.widget.size(), QtGui.QImage.Format_RGB32)
        painter = QtGui.QPainter(image)
        self.widget.render(painter)
        image.save(filename)
        painter.end()

    def close(self):
        self.widget.page = None
        self.widget.web = None
        self.widget.close()
        self.widget = None

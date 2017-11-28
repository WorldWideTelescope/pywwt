# This file contains the defintion of the Qt widget. Most of the code here
# deals with differences between WebEngine and WebKit (either of which may be
# available in Qt) and also deals with figuring out how we know once WWT is
# set up.

from __future__ import absolute_import, division, print_function

import os
import json

from qtpy.QtWebEngineWidgets import QWebEngineView, QWebEnginePage, WEBENGINE
from qtpy import QtWidgets, QtCore

from .core import BaseWWTWidget
from .logger import logger

__all__ = ['WWTQtWidget']

WWT_JSON_FILE = os.path.join(os.path.dirname(__file__), 'static', 'wwt_json_api.js')

with open(WWT_JSON_FILE) as f:
    WWT_JSON = f.read()

WWT_HTML_FILE = os.path.join(os.path.dirname(__file__), 'static', 'wwt.html')

with open(WWT_HTML_FILE) as f:
    WWT_HTML = f.read()


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
                print(message)

        def _check_ready(self):
            if not self._check_running:
                self._check_running = True
                self.runJavaScript('wwt_ready;', self._wwt_ready_callback)

    else:

        def runJavaScript(self, code):
            result = self._frame.evaluateJavaScript(code)
            return result

        def _check_ready(self):
            result = self.runJavaScript('wwt_ready;')
            if result == 1:
                self._timer.stop()
                self.wwt_ready.emit()


class CoreWWTQtWidget(QtWidgets.QWidget):

    def __init__(self, parent=None):

        super(CoreWWTQtWidget, self).__init__(parent=parent)

        self.web = QWebEngineView()
        self.page = WWTQWebEnginePage()
        self.page.setView(self.web)
        self.web.setPage(self.page)
        self.web.setHtml(WWT_HTML)

        layout = QtWidgets.QVBoxLayout()
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
        self._run_js(self._js_queue)
        self._js_queue = ""

    def _run_js(self, js):
        if not js:
            return
        if self._wwt_ready:
            logger.debug('Running javascript: %s' % js)
            return self.page.runJavaScript(js)
        else:
            logger.debug('Caching javascript: %s' % js)
            self._js_queue += js + '\n'


app = None


class WWTQtWidget(BaseWWTWidget):

    def __init__(self, block_until_ready=False):

        global app
        if app is None:
            app = QtWidgets.QApplication.instance()
            if app is None:
                app = QtWidgets.QApplication([''])

        self.widget = CoreWWTQtWidget()
        self.widget.show()

        if block_until_ready:
            while True:
                app.processEvents()
                if self.widget._wwt_ready:
                    break

        super(WWTQtWidget, self).__init__()

    def _send_msg(self, **kwargs):
        msg = json.dumps(kwargs)
        return self.widget._run_js("wwt_apply_json_message(wwt, {0})".format(msg))

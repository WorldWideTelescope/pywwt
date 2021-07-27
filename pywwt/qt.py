# Copyright 2018-2021 the .NET Foundation
# Licensed under the BSD license

"""
This file defines the WWT Qt widget.

Most of the code here deals with differences between WebEngine and WebKit
(either of which may be available in Qt) and also deals with figuring out how we
know once WWT is set up.
"""

import json
import time

from qtpy.QtWebEngineWidgets import QWebEngineView, QWebEnginePage, WEBENGINE
from qtpy import QtWidgets, QtGui, QtCore

from .app import get_qapp
from .core import BaseWWTWidget
from .logger import logger
from .data_server import get_data_server

__all__ = ['WWTQtClient']

APP_LIVENESS_DEADLINE = 10  # seconds


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
    Subclass of QWebEnginePage that abstracts the JavaScript invocation
    mechanism.
    """

    app_message_callback = None

    wwt_ready = QtCore.Signal()
    """A signal raised when the WWT app first becomes ready.

    The glue-wwt plugin requires this signal, so we can't move or remove it.
    """

    def __init__(self, parent=None):
        super(WWTQWebEnginePage, self).__init__(parent=parent)

        if WEBENGINE:
            self._js_response_received = False
            self._js_response = None
        else:
            self._frame = self.mainFrame()

    if WEBENGINE:

        def javaScriptConsoleMessage(
            self,
            level=None,
            message=None,
            line_number=None,
            source_id=None
        ):
            try:
                context = 'level={0}, line_number={1}, source_id={2}'.format(level, line_number, source_id)
                self._common_console_handler(message, context)
            except:  # noqa: E722
                logger.exception('unhandled Python exception in Qt webengine javaScriptConsoleMessage')  # noqa

        def _process_js_response(self, result):
            self._js_response_received = True
            self._js_response = result

        def runJavaScript(self, code):
            app = get_qapp()
            self._js_response_received = False
            self._js_response = None
            super(WWTQWebEnginePage, self).runJavaScript(code, self._process_js_response)

            while not self._js_response_received:
                app.processEvents()

            return self._js_response

    else:

        def javaScriptConsoleMessage(
            self,
            message=None,
            line_number=None,
            source_id=None
        ):
            try:
                context = 'line_number={0}, source_id={1}'.format(line_number, source_id)
                self._common_console_handler(message, context)
            except:  # noqa: E722
                logger.exception('unhandled Python exception in Qt webkit javaScriptConsoleMessage')  # noqa

        def runJavaScript(self, code):
            return self._frame.evaluateJavaScript(code)

    def _common_console_handler(self, message, context):
        if message.startswith('pywwtMessage:'):
            try:
                payload = json.loads(message[13:])
            except Exception as e:
                logger.warning('invalid pywwtMessage JSON: %s', e)
                return

            if self.app_message_callback is None:
                logger.warning('received app message, but no handler available; message: %s', payload)
            else:
                try:
                    self.app_message_callback(payload)
                except Exception:
                    logger.exception('error handling app message; payload: %s', payload)  # noqa
        else:
            logger.debug('JS console message: %s (%s)', message, context)


class WWTQtWidget(QtWidgets.QWidget):
    def __init__(self, url, parent=None):
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

    # More mouse-drag helpers

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

    hide_all_chrome : optional `bool`
        Configures the WWT frontend to hide all user-interface "chrome".
        Defaults to true to maintain compatibility with the historical
        pywwt user experience.
    """

    def __init__(self, block_until_ready=False, size=None, hide_all_chrome=True):
        app = get_qapp()

        self._data_server = get_data_server()

        wwt_url = self._data_server.static_url('qtwrapper.html')
        self.widget = WWTQtWidget(url=wwt_url)

        if size is not None:
            self.widget.resize(*size)

        self.widget.page.app_message_callback = self._on_app_message
        self.widget.show()

        super(WWTQtClient, self).__init__(
            hide_all_chrome=hide_all_chrome,
        )

        # Start polling for the app to start responding to messages

        self._last_pong_timestamp = 0
        self._timer = QtCore.QTimer()
        self._timer.timeout.connect(self._check_ready)
        self._timer.start(1000)

        # TODO: this should be more generic
        if block_until_ready:
            while True:
                app.processEvents()
                if self._appAlive:
                    break

    def _check_ready(self):
        # If this Qt signal callback function raises an unhandled exception, it
        # can crash the whole process! Which is ridiculous but let's try to do
        # our part to make that not happen.
        #
        # Cf: https://doc.qt.io/qt-5/exceptionsafety.html#signals-and-slots
        try:
            self._check_ready_inner()
        except:  # noqa: E722
            logger.exception('unhandled exception in Qt check-ready callback')

    def _check_ready_inner(self):
        # Send the ping. We have some extra paranoia here in case funky
        # sequencing can happen in the stop() method.

        if self.widget is not None and self.widget.page is not None:
            self._actually_send_msg({
                'type': 'wwt_ping_pong',
                'sessionId': 'qt',
                'threadId': str(time.time()),
            })

        # Evaluate pong status, with a hack for glue-wwt -- we need to emit the
        # wwt_ready signal on our `page` field. It hardcodes the location of the
        # field so we can't rationalize this API.

        alive = (time.time() - self._last_pong_timestamp) < APP_LIVENESS_DEADLINE

        if not self._appAlive and alive:
            self.widget.page.wwt_ready.emit()

        self._on_app_status_change(alive=alive)

    def _on_app_message(self, payload):
        ptype = payload.get('type')

        if ptype == 'wwt_ping_pong':
            try:
                ts = float(payload['threadId'])
            except Exception:
                logger.exception('invalid timestamp in pywwt Qt pingpong response')
            else:
                self._last_pong_timestamp = ts
        else:
            self._on_app_message_received(payload)

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

    def _actually_send_msg(self, payload):
        jmsg = json.dumps(payload)
        return self.widget.page.runJavaScript("pywwtSendMessage({0});".format(jmsg))

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
        self._timer.stop()
        self.widget.page = None
        self.widget.web = None
        self.widget.close()
        self.widget = None

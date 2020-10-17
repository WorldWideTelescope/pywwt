import os
from datetime import datetime

import pytest

try:
    import qtpy
except ImportError:
    QT_INSTALLED = False
except Exception:  # will catch PythonQtError
    QT_INSTALLED = False
else:
    QT_INSTALLED = True

try:
    import OpenGL.GL as gl
except ImportError:
    OPENGL_INSTALLED = False
else:
    OPENGL_INSTALLED = True

if QT_INSTALLED and OPENGL_INSTALLED:

    from qtpy.QtWidgets import QOpenGLWidget

    class OpenGLWidget(QOpenGLWidget):

        def getOpenGLInfo(self):

            gl_parameters = {'vendor': gl.GL_VENDOR,
                             'renderer': gl.GL_RENDERER,
                             'version': gl.GL_VERSION,
                             'shader': gl.GL_SHADING_LANGUAGE_VERSION}

            info = {}
            for key, setting in gl_parameters.items():
                try:
                    info[key] = gl.glGetString(setting).decode('ascii')
                except Exception:
                    info[key] = 'could not be determined'

            return info


_cached_opengl_renderer = ''


RUNNING_ON_CI = os.environ.get('CI') or os.environ.get('AGENT_OS')


def pytest_report_header(config):
    global _cached_opengl_renderer

    lines = []

    if QT_INSTALLED:

        # Get Python Qt bindings version
        lines.append("PyQt: {0}".format(qtpy.PYQT_VERSION))
        lines.append("PySide: {0}".format(qtpy.PYSIDE_VERSION))

        # Get WebEngine/WebKit info
        from qtpy.QtWebEngineWidgets import WEBENGINE
        lines.append("Web Framework: {0}".format('WebEngine' if WEBENGINE else 'WebKit'))

        if OPENGL_INSTALLED:

            # Get OpenGL version
            from .app import get_qapp
            get_qapp()
            widget = OpenGLWidget()
            widget.show()
            opengl_info = widget.getOpenGLInfo()
            widget.close()

            lines.append("OpenGL Vendor: {0}".format(opengl_info['vendor']))
            lines.append("OpenGL Renderer: {0}".format(opengl_info['renderer']))
            lines.append("OpenGL Version: {0}".format(opengl_info['version']))
            lines.append("Shader Version: {0}".format(opengl_info['shader']))

            # This is (no surprise) a hack to enable the Windows testing
            # framework to check which renderer WebKit is using, which affets
            # the output.
            _cached_opengl_renderer = opengl_info['renderer']
        else:

            lines.append("Could not determine OpenGL version (OpenGL package required)")

    else:

        lines.append("Qt not installed")

    return os.linesep + os.linesep.join(lines) + os.linesep


def pytest_unconfigure(config):
    if QT_INSTALLED:
        from .app import cleanup_qapp
        cleanup_qapp()


REFERENCE_TIME = datetime(2017, 2, 1, 0, 0, 0, 0)

if QT_INSTALLED:

    @pytest.fixture(scope='session')
    def wwt_qt_client():
        from .qt import WWTQtClient
        wwt = WWTQtClient(block_until_ready=True, size=(400, 400))
        wwt.set_current_time(REFERENCE_TIME)
        wwt.pause_time()
        yield wwt
        wwt.close()

    @pytest.fixture(scope='function')
    def wwt_qt_client_isolated():
        from .qt import WWTQtClient
        wwt = WWTQtClient(block_until_ready=True, size=(400, 400))
        wwt.set_current_time(REFERENCE_TIME)
        wwt.pause_time()
        yield wwt
        wwt.close()

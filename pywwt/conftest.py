import os
import sys

try:
    import qtpy
except ImportError:
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
            info = {'vendor': gl.glGetString(gl.GL_VENDOR).decode('ascii'),
                    'renderer': gl.glGetString(gl.GL_RENDERER).decode('ascii'),
                    'version': gl.glGetString(gl.GL_VERSION).decode('ascii'),
                    'shader_version': gl.glGetString(gl.GL_SHADING_LANGUAGE_VERSION).decode('ascii')}
            return info


def pytest_report_header(config):

    print("IN HEADER")

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
            lines.append("Shader Version: {0}".format(opengl_info['shader_version']))

        else:

            lines.append("Could not determine OpenGL version (OpenGL package required)")

    else:

        lines.append("Qt not installed")

    return os.linesep + os.linesep.join(lines) + os.linesep

#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function
import os
from glob import glob
from os.path import join as pjoin


from setupbase import (
    create_cmdclass, install_npm, ensure_targets,
    find_packages, combine_commands, ensure_python,
    get_version, HERE
)

from setuptools import setup


# The name of the project
name = 'pywwt'

# Ensure a valid python version
ensure_python('>=2.7')

# Get our version
version = get_version(pjoin(name, '_version.py'))

nb_path = pjoin(HERE, name, 'nbextension', 'static')
lab_path = pjoin(HERE, name, 'labextension')

# Representative files that should exist after a successful build
jstargets = [
    pjoin(nb_path, 'index.js'),
    pjoin(HERE, 'lib', 'plugin.js'),
]

package_data_spec = {
    name: [
        'nbextension/static/*.*js*',
        'nbextension/static/*.html',
        'nbextension/static/interactive_figure/*.html',
        'nbextension/static/interactive_figure/*.js',
        'labextension/*.tgz',
        'tests/data/*/*.png'
    ]
}

data_files_spec = [
    ('share/jupyter/nbextensions/pywwt', nb_path, '*.js*'),
    ('share/jupyter/nbextensions/pywwt', nb_path, '*.html'),
    ('share/jupyter/lab/extensions', lab_path, '*.tgz'),
    ('etc/jupyter/nbconfig/notebook.d' ,
     os.path.join(HERE, 'jupyter.d', 'notebook.d'), 'pywwt.json'),
    ('etc/jupyter/jupyter_notebook_config.d' ,
     os.path.join(HERE, 'jupyter.d', 'jupyter_notebook_config.d'), 'pywwt.json')]


cmdclass = create_cmdclass('jsdeps', package_data_spec=package_data_spec,
    data_files_spec=data_files_spec)
cmdclass['jsdeps'] = combine_commands(
    install_npm(HERE, build_cmd='build'),
    ensure_targets(jstargets),
)

with open('README.rst') as f:
    LONG_DESCRIPTION = f.read()

setup_args = dict(
    name            = name,
    description     = 'The AAS WorldWide Telescope from Python',
    long_description = LONG_DESCRIPTION,
    version         = version,
    scripts         = glob(pjoin('scripts', '*')),
    cmdclass        = cmdclass,
    packages        = find_packages(),
    author          = 'Thomas P. Robitaille, O. Justin Otor, and John ZuHone',
    author_email    = 'thomas.robitaille@gmail.com',
    url             = 'https://github.com/WorldWideTelescope/pywwt',
    license         = 'BSD',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Jupyter', 'Widgets', 'IPython'],
    classifiers     = [
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Topic :: Multimedia :: Graphics',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Framework :: Jupyter',
    ],
    include_package_data = True,
    install_requires = [
        'numpy>=1.9',
        'matplotlib>1.5',
        'astropy>=1.0',
        'requests',
        'beautifulsoup4',
        'python-dateutil',
        'lxml',
        'ipywidgets>=7.0.0',
        'ipyevents',
        'traitlets',
        'reproject>=0.4',
        'qtpy',
        'flask',
        'flask-cors',
        'six'
    ],
    extras_require = {
        'test': [
            'pytest',
            'pytest-cov>=2.6.1',
            'pytest-remotedata>=0.3.1',
        ],
        'docs': [
            'sphinx>=1.6',
            'sphinx-automodapi',
            'numpydoc',
            'sphinx_rtd_theme',
            'jupyter_sphinx',
        ],
        'qt': [
            'PyQt5;python_version>="3"',
            'PyQtWebEngine;python_version>="3"',
        ],
        'lab': [
            'jupyterlab'
        ]
    },
    entry_points = {
    },
)

if __name__ == '__main__':
    setup(**setup_args)

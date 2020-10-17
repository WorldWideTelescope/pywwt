#! /usr/bin/env python
# -*- mode: python; coding: utf-8 -*-
# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function
import io
import os
import sys

from glob import glob
from os.path import join as pjoin

sys.path.append('.')
from setupbase import (
    create_cmdclass, install_npm, ensure_targets,
    find_packages, combine_commands, ensure_python,
    get_version, HERE
)

from setuptools import setup

ensure_python('>=3.7')

# Gather package metadata.

name = 'pywwt'
version = get_version(pjoin(name, '_version.py'))

with io.open('README.md', encoding='utf_8') as f:
    LONG_DESCRIPTION = f.read()

# Wire up the NPM build to the Python package build -- we generate JavaScript
# artifacts from the `frontend/` package and then include them as data assets in
# the pywwt Python package.

nb_path = pjoin(name, 'nbextension', 'static')

js_outputs = [
    pjoin(nb_path, 'index.js'),
]

js_content_command = combine_commands(
    install_npm('frontend', build_cmd='pywwt-export'),
    ensure_targets(js_outputs),
)

# Custom "command class" that (1) makes sure to create the JS content, (2)
# includes that content as extra "package data" in the Python package, and (3)
# can install special metadata files in the Python environment root.

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

lab_path = pjoin(name, 'labextension')
local_nbdotd_path = pjoin('jupyter.d', 'notebook.d')
local_jnbcfgdotd_path = pjoin('jupyter.d', 'jupyter_notebook_config.d')

data_files_spec = [
    ('share/jupyter/nbextensions/pywwt', nb_path, '*.js*'),
    ('share/jupyter/nbextensions/pywwt', nb_path, '*.html'),
    ('share/jupyter/lab/extensions', lab_path, '*.tgz'),
    ('etc/jupyter/nbconfig/notebook.d', local_nbdotd_path, 'pywwt.json'),
    ('etc/jupyter/jupyter_notebook_config.d' ,local_jnbcfgdotd_path, 'pywwt.json'),
]

cmdclass = create_cmdclass(
    'js-content',
    package_data_spec = package_data_spec,
    data_files_spec = data_files_spec
)
cmdclass['js-content'] = js_content_command

# Ready to go!

setup_args = dict(
    name            = name,
    description     = 'The AAS WorldWide Telescope from Python',
    long_description = LONG_DESCRIPTION,
    long_description_content_type = 'text/markdown',
    version         = version,
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
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Framework :: Jupyter',
    ],
    include_package_data = True,
    python_requires = '>=3.7',
    install_requires = [
        'numpy>=1.9',
        'matplotlib>1.5',
        'astropy>=1.0,!=4.0.1',
        'requests',
        'beautifulsoup4',
        'python-dateutil',
        'lxml',
        'ipywidgets>=7.0.0',
        'ipyevents',
        'traitlets>=5',
        'reproject>=0.4',
        'qtpy',
        'tornado',
        'pytz',
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

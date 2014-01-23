#!/usr/bin/env python
from setuptools import setup, find_packages

setup(name='pywwt',
      version='0.1.0',
      description = 'Python interface to World Wide Telescope',
      author='John ZuHone',
      author_email='jzuhone@gmail.com',
      url='http://github.com/jzuhone/pywwt',
      classifiers=[
          'Intended Audience :: Science/Research',
          'Operating System :: OS Independent',
          'Programming Language :: Python :: 2.7',
          'Topic :: Scientific/Engineering :: Visualization',
          ],
      packages = find_packages()
    )

#!/usr/bin/env python
from setuptools import setup, find_packages

setup(name='pywwt',
      packages = ['pywwt'],
      version='0.2.0',
      description = 'Python interface to World Wide Telescope',
      author='John ZuHone',
      author_email='jzuhone@gmail.com',
      url='http://github.com/jzuhone/pywwt',
      download_url='https://github.com/jzuhone/pywwt/tarball/0.2.0',
      install_requires = ["numpy","beautifulsoup4","matplotlib",
                          "astropy","requests","lxml"],
      classifiers=[
          'Intended Audience :: Science/Research',
          'Operating System :: OS Independent',
          'Programming Language :: Python :: 2.7',
          'Programming Language :: Python :: 3.4',
          'Topic :: Scientific/Engineering :: Visualization',
          ],
      )

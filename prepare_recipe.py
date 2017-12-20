import os
import sys
import subprocess
from datetime import datetime

import requests
from jinja2 import Template


SOURCE_DEV = """
source:
  path: ../../{{package}}
"""

SOURCE_STABLE = """
source:
  fn: {{filename}}
  url: {{url}}
  md5: {{md5_digest}}
"""


def prepare_recipe_dev(package):

    with open('recipes/{0}/meta.yaml'.format(package)) as f:
        content = f.read()

    if os.path.exists(package):
        os.chdir(package)
        package_dir = package
    elif os.path.exists(package + '.git'):
        os.chdir(package + '.git')
        package_dir = package + '.git'
    else:
        print('Package {0} not cloned'.format(package))
        sys.exit(1)

    overall_version = subprocess.check_output('python setup.py --version', shell=True).decode('ascii').splitlines()[-1]
    utime = subprocess.check_output('git log -1 --pretty=format:%ct', shell=True).decode('ascii')
    chash = subprocess.check_output('git log -1 --pretty=format:%h', shell=True).decode('ascii')
    os.chdir('..')

    stamp = datetime.fromtimestamp(int(utime)).strftime('%Y%m%d%H%M%S')

    overall_version = overall_version.strip().split('.dev')[0]

    version = overall_version + '.dev' + stamp + '.' + chash

    source = Template(SOURCE_DEV).render(package=package_dir)

    recipe = Template(content).render(version=version, source=source)

    with open('recipes/{0}/meta.yaml'.format(package), 'w') as f:
        f.write(recipe)


def flexible_int(s):
    try:
        return int(s)
    except:
        return -1


def prepare_recipe_stable(package):

    with open('recipes/{0}/meta.yaml'.format(package)) as f:
        content = f.read()

    # Find latest stable version from PyPI
    package_json = requests.get('https://pypi.python.org/pypi/{package}/json'.format(package=package)).json()
    version = sorted(package_json['releases'], key=lambda s: tuple(map(flexible_int, s.split('.'))))[-1]
    releases = package_json['releases'][version]
    for release in releases:
        if release['python_version'] == 'source':
            break
    else:
        raise Exception("Cannot find source package for {0}".format(package))

    source = Template(SOURCE_STABLE).render(**release)

    recipe = Template(content).render(version=version, source=source)

    with open('recipes/{0}/meta.yaml'.format(package), 'w') as f:
        f.write(recipe)


def main_stable(*packages):
    for package in packages:
        prepare_recipe_stable(package)


def main_dev(*packages):
    for package in packages:
        prepare_recipe_dev(package)


if __name__ == "__main__":
    if '--stable' in sys.argv:
        sys.argv.remove('--stable')
        main_stable(*sys.argv[1:])
    else:
        main_dev(*sys.argv[1:])

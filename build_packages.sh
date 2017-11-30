#!/bin/bash -xe

# Switch to root environment to have access to conda-build
source activate root

# Install conda-build and the anaconda client
conda install conda-build anaconda-client

# Install PyQt and jinja2 for the prepare script to work
conda install jinja2 pyqt requests

# Don't auto-upload, instead we upload manually specifying a token.
conda config --set anaconda_upload no

packages="ipyevents pywwt"

for package in $packages; do

  if [[ $STABLE == true ]]; then

    # The following puts the correct version number and md5 in the recipes
    python prepare_recipe.py $package --stable;

  else

    if [[ $package == pywwt ]]; then
      git clone "git://github.com/WorldWideTelescope/"$package".git";
    else
      git clone "git://github.com/astrofrog/"$package".git";
    fi

    # The following puts the correct version number in the recipes
    python prepare_recipe.py $package;

  fi

  cd recipes

  # If we are processing a pull request, we shouldn't skip builds even if they
  # exist already otherwise some builds might not get tested
  if [[ $TRAVIS_EVENT_TYPE != pull_request ]]; then
    skip="--skip-existing"
  else
    skip="";
  fi

  conda build $skip --old-build-string --keep-old-work --python $PYTHON_VERSION $package
  output=`conda build $skip --old-build-string --python $PYTHON_VERSION $package --output`

  # If the file does not exist, the build must have skipped because the build
  # already exists in the channel, so we just proceed to the next package
  if [ ! -f $output ]; then
    cd ..
    continue;
  fi

  if [[ $TRAVIS_EVENT_TYPE != pull_request && $TRAVIS_BRANCH == master ]]; then
    if [[ $STABLE == true ]]; then
      anaconda -t $ANACONDA_TOKEN upload $output;
    else
      anaconda -t $ANACONDA_TOKEN upload -l dev --force $output;
    fi
  fi

  cd ..

done

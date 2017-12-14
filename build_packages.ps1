# Show which commands are being run
Set-PSDebug -Trace 1

# We use the following function to exit the script after any failing command
function checkLastExitCode {
  if ($lastExitCode) {
    echo "ERROR: the last command returned the following exit code: $lastExitCode"
    Exit $lastExitCode
  }
}

if ($env:ANACONDA_TOKEN -eq $null) {
  echo "WARNING: ANACONDA_TOKEN is not set"
}

# Switch to root environment to have access to conda-build
activate root
checkLastExitCode

# Install conda-build and the anaconda client
conda install -n root conda-build anaconda-client
checkLastExitCode

# Install PyQt and jinja2 for the prepare script to work
conda install jinja2 pyqt requests git
checkLastExitCode

# Install node for building Jupyter widgets
conda install nodejs
checkLastExitCode

# Don't auto-upload, instead we upload manually specifying a token.
conda config --set anaconda_upload no
checkLastExitCode

$packages = @("ipyevents", "pywwt")

foreach ($package in $packages) {

  if ($env:STABLE -match "true") {

    # The following puts the correct version number and md5 in the recipes
    python prepare_recipe.py $package --stable
    checkLastExitCode

  } else {

    if ($package -match "pywwt") {
      git clone git://github.com/WorldWideTelescope/$package
      checkLastExitCode
    } else {
      git clone git://github.com/mwcraig/$package
      checkLastExitCode
    }

    # The following puts the correct version number in the recipes
    python prepare_recipe.py $package
    checkLastExitCode

  }

  cd recipes
  checkLastExitCode

  # If we are processing a pull request, we shouldn't skip builds even if they
  # exist already otherwise some builds might not get tested
  if ($env:APPVEYOR_PULL_REQUEST_NUMBER -eq $null) {
    $skip = "--skip-existing"
  } else {
    $skip = ""
  }

  conda build $skip --old-build-string --keep-old-work --python $env:PYTHON_VERSION $package
  checkLastExitCode

  $BUILD_OUTPUT = cmd /c conda build --old-build-string --python $env:PYTHON_VERSION $package --output 2>&1
  echo $BUILD_OUTPUT

  # If the file does not exist, the build must have skipped because the build
  # already exists in the channel, so we just proceed to the next package
  if (-not ($BUILD_OUTPUT | Test-Path)) {
    cd ..
    continue
  }

  if ($env:APPVEYOR_PULL_REQUEST_NUMBER -eq $null -and $env:APPVEYOR_REPO_BRANCH -eq "conda-dev") {
    if ($env:STABLE -match "true") {
      anaconda -t $env:ANACONDA_TOKEN upload $BUILD_OUTPUT;
      checkLastExitCode
    } else {
      anaconda -t $env:ANACONDA_TOKEN upload -l dev $BUILD_OUTPUT;
      checkLastExitCode
    }
  }

  cd ..

}

Releasing
=========

Start the release process by creating a new branch named
``release-<version>``, where ``<version>`` will be the version to be released.

The first real step is edit the ``CHANGES.rst`` file to include the date of
the release after the version number. Make sure the changelog is up to
date, using::

    git log v<prev>..HEAD

to review the commit history. Then edit the following files to update the
version numbers:

* ``pywwt/_version.py`` (make sure the string in the tuple is set to ``final``)
* ``package.json``

At this point, commit all changes and use the following for the commit message::

    Preparing release v<version>

Now make sure there are no temporary files in the repository::

    git clean -fxd

and build the release files::

    python setup.py sdist bdist_wheel --universal

Go inside the ``dist`` directory, and you should see a tar file and a wheel.
At this point, you should try::

    pip install dist/pywwt-*.tar.gz

and validate the package as extensively as you can.

Push the current branch to GitHub and create a pull request against
``master``. Get final validation that the CI likes the release commit, but do
*not* merge the PR yet.

Once you are satisfied that the release is good, you can merge in the pull
request. Next, fetch the latest master branch from the repository and tag
the release with::

    git tag -m v<version> v<version>

If you have PGP keys set up, you can sign the tag by also including ``-s``.

Push the tag to GitHub::

    git push --tags

Azure should now run the continuous integration on the tag and publish the packages
to PyPI and npm. If not, resolve any issues, you can alwasy delete the tag from
the repository, fix any issues, and try again. Once the release is on PyPI and npm,
you can proceed.

If this release is a new minor series (``0.N.0``), create a new branch for point
releases as well::

    git branch v0.N.x

and push that branch to GitHub.

Now change the versions in the files listed above to the next version. For the
``pywwt/_version.py`` file, change ``final`` to ``dev``. Commit the changes
with the message::

    Back to development: v<next_version>

Push this update to your release PR branch and let the CI run again.

While waiting, update the ``stable`` branch to trigger an update on
ReadTheDocs::

    git push wwt v<version>:stable

Here, ``wwt`` is the name of the Git remote corresponding to
``WorldWideTelescope/pywwit.git`` on GitHub. A ``-f`` flag may be necessary if
the previous release had backports cherry-picked from ``master``.

Finally, create a new release on GitHub. Copy the release notes from
``CHANGES.rst``, adapting the ReStructuredText markup to Markdown.

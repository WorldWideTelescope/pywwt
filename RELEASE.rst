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

* ``docs/conf.py``
* ``pywwt/_version.py`` (make sure the string in the tuple is set to ``final``)
* ``pywwt/jupyter.py``
* ``lib/wwt.js``
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

Once you are satisfied that the release is good you can upload the release
using twine::

    twine upload pywwt-*.tar.gz pywwt-*-none-any.whl

If you don't have twine installed, you can get it with ``pip install twine``.

Next, go back to the root of the repository and publish the package to npm with::

    git clean -fxd
    npm install
    npm publish

At this point, you can tag the release with::

    git tag -m v<version> v<version>

If you have PGP keys set up, you can sign the tag by also including ``-s``.

If this release is a new minor series (``0.N.0``), create a new branch for point
releases as well::

    git branch v0.N.x

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

When the CI on your release branch has finished, merge it into ``master``.
Push your release tag::

    git push --tags

If necessary, also push your ``v0.N.x`` point-release branch.

Finally, create a new release on GitHub. Copy the release notes from
``CHANGES.rst``, adapting the ReStructuredText markup to Markdown.

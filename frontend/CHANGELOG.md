# npm:pywwt 1.1.0 (2020-10-22)

- The Jupyter widget has reworked multi-view management to behave much better
  when there are multiple views for the same widget model, or when views are
  hidden and recreated.
- The Jupyter widget now exposes a _viewConnected trait to indicate the case
  when the widget has been created, but there are no active views presented to
  the user. This isn't wired up to the Python layer, but it could be useful
  later.

# npm:pywwt 1.0.0 (2020-10-21)

- Address #258 by transmitting WWT clock information using a reference point and
  a rate, rather than constantly transmitting the current time. Dramatically
  reduces JS <=> Python traffic.
- Tidy up the JavaScript files.

# npm:pywwt 0.9.1 (2020-10-18)

- First release with version number decoupled from the pywwt Python package.
- No code chages, but internal reorganizations including the use of Cranko for
  release automation.

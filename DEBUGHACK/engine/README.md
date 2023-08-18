# @wwtelescope/engine

The [@wwtelescope/engine] package is the core rendering engine in the [AAS]
[WorldWide Telescope][wwt-home] (WWT) [WebGL engine] stack. Learn more about WWT
[here][wwt-home].

[@wwtelescope/engine]: https://www.npmjs.com/package/@wwtelescope/engine
[AAS]: https://aas.org/
[wwt-home]: https://worldwidetelescope.org/home/
[WebGL engine]: https://github.com/WorldWideTelescope/wwt-webgl-engine/

For more information, see [the main README of the wwt-webgl-engine
repository][main-readme], which contains the source for this package.

[main-readme]: https://github.com/WorldWideTelescope/wwt-webgl-engine/#readme


## Source structure

The WWT engine code originated in the C# implementation of the [WWT Windows
Client][winclient]. Initially, this code was transpiled into JavaScript using a
tool called [ScriptSharp], which has been unmaintained for a long time.

[winclient]: https://github.com/WorldWideTelescope/wwt-windows-client/
[ScriptSharp]: https://github.com/nikhilk/scriptsharp

Currently, the engine is built from the (very human-readable) JS outputs of the
ScriptSharp tool, stored in the `js/` subdirectory here. Code that hasn't yet
been extracted into more idiomatic JS lives in `js/transpiled.js`.

The directory `csharp_ref` contains the C# code that was used as the basis for
the JS at the time of the switch away from ScriptSharp. To avoid confusion,
these files will be removed as they are fully superseded by idiomatic JS.

// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The toplevel WorldWide Telescope WebGL engine API module.
//
// To maintain compatibility with a *lot* of legacy code, we export way more
// types and interfaces than we would if we were starting from scratch, often
// with confusing or misspelled names. So it goes.
//
// The import/exports here are in rough dependency order throughout the
// codebase, although there are numerous places where circular references sneak
// in.

export { ss } from "./ss.js";

export { Util } from "./baseutil.js";

export { CalD, DAY_OF_WEEK, DT } from "./astrocalc/date.js";
export { COR, C3D, CT } from "./astrocalc/coordinate_transformation.js";
export { ASEP } from "./astrocalc/angular_separation.js";
export { CAAEarth, VSC, } from "./astrocalc/earth.js";
export { CAAFK5 } from "./astrocalc/fk5.js";
export { NUC, CAANutation } from "./astrocalc/nutation.js";
export { CAASun } from "./astrocalc/sun.js";
export { CAAMercury } from "./astrocalc/mercury.js";
export { CAAVenus } from "./astrocalc/venus.js";
export { CAAMars } from "./astrocalc/mars.js";
export { CAAJupiter } from "./astrocalc/jupiter.js";
export { CAASaturn } from "./astrocalc/saturn.js";
export { CAAUranus } from "./astrocalc/uranus.js";
export { CAANeptune } from "./astrocalc/neptune.js";
export { CAAPluto, PlutoCoefficient1, PlutoCoefficient2 } from "./astrocalc/pluto.js";
export { CAAKepler } from "./astrocalc/kepler.js";
export { ABR, ACFT } from "./astrocalc/aberration.js";
export { DYT } from "./astrocalc/dynamical_time.js";
export { CAAEclipticalElementDetails, CAAEclipticalElements } from "./astrocalc/ecliptical_elements.js";
export { EPO } from "./astrocalc/elements_planetary_orbit.js";
export { EOE, EPD, EOD, EO, ELL } from "./astrocalc/elliptical.js";
export { EOT } from "./astrocalc/equation_of_time.js";
export { GMD, GMDS, GM } from "./astrocalc/galilean_moons.js";
export { CAAGlobe } from "./astrocalc/globe.js";
export { IFR } from "./astrocalc/illuminated_fraction.js";
export { INTP } from "./astrocalc/interpolate.js";
export { CAAMoon, MoonCoefficient1, MoonCoefficient2 } from "./astrocalc/moon.js";
export { MIFR } from "./astrocalc/moon_illuminated_fraction.js";
export { CAAMoonNodes } from "./astrocalc/moon_nodes.js";
export { CAAMoonPerigeeApogee, MPAC } from "./astrocalc/moon_perigee_apogee.js";
export { CAAMoonPhases } from "./astrocalc/moon_phases.js";
export { CAAParallax, CAATopocentricEclipticDetails } from "./astrocalc/parallax.js";
export { CAASidereal } from "./astrocalc/sidereal.js";
export { CAAPhysicalJupiterDetails, CAAPhysicalJupiter } from "./astrocalc/physical_jupiter.js";
export { CAAPhysicalMarsDetails, CAAPhysicalMars } from "./astrocalc/physical_mars.js";
export { CAAPhysicalSunDetails, CAAPhysicalSun } from "./astrocalc/physical_sun.js";
export { CAAPrecession } from "./astrocalc/precession.js";
export { CAARiseTransitSetDetails, CAARiseTransitSet } from "./astrocalc/rise_transit_set.js";
export { CAASaturnRingDetails, CAASaturnRings } from "./astrocalc/saturn_rings.js";
export { CAAStellarMagnitudes } from "./astrocalc/stellar_magnitudes.js";

export { BlendState } from "./blend_state.js";
export { Color, Colors } from "./color.js";
export { URLHelpers, URLRewriteMode } from "./url_helpers.js";

export {
    LocationHint,
    PositionTexture,
    PositionColoredTextured,
    PositionColored,
    PositionNormalTexturedTangent,
    Vector3d,
    Vector2d,
    Matrix3d,
    Matrix2d,
    DoubleUtilities,
    PlaneD,
    Vector4d,
    PositionNormalTexturedX2,
    PositionNormalTextured,
    SphereHull,
    ConvexHull
} from "./double3d.js";

export {
    Rectangle,
    Guid,
    Mouse,
    Language,
    Cursor,
    Cursors,
    Keys,
    SelectLink,
    PopupVolume,
    PopupColorPicker,
    OverlayProperties,
    DialogResult,
} from "./util.js";

export { AstroRaDec, RiseSetDetails, AstroCalc } from "./astrocalc.js";

export {
    ShortIndexBuffer,
    IndexBuffer,
    VertexBufferBase,
    PositionVertexBuffer,
    PositionNormalTexturedVertexBuffer,
    PositionNormalTexturedTangentVertexBuffer,
} from "./graphics/gl_buffers.js"

export { Texture } from "./graphics/texture.js";
export { Tessellator } from "./graphics/tessellator.js";

export {
    SimpleLineShader,
    SimpleLineShader2D,
    OrbitLineShader,
    LineShaderNormalDates,
    TimeSeriesPointSpriteShader,
    KeplerPointSpriteShader,
    EllipseShader,
    ModelShader,
    ModelShaderTan,
    TileShader,
    FitsShader,
    ImageShader,
    ImageShader2,
    SpriteShader,
    ShapeSpriteShader,
    TextShader,
} from "./graphics/shaders.js";

export {
    CullMode,
    PointScaleTypes,
    DataItem,
    Dates,
    SimpleLineList,
    OrbitLineList,
    LineList,
    TriangleList,
    TriangleFanList,
    PointList,
    TimeSeriesLineVertex,
    TimeSeriesPointVertex,
} from "./graphics/primitives3d.js";

// These are new, post-C# APIs that we wouldn't normally expose, but they
// support the test suite.
export {
    set_tilePrepDevice,
    set_useGlVersion2
} from "./render_globals.js";

export { Bitmap } from "./utilities/bitmap.js";

export {
    ContextMenuStrip,
    ToolStripMenuItem,
    ToolStripSeparator,
    TagMe,
} from "./utilities/context_menu_strip.js";

export { BinaryReader } from "./utilities/binary_reader.js";
export { SimpleInput } from "./utilities/simple_input.js";
export { XmlTextWriter, Formatting } from "./utilities/xml_text_writer.js";

export { Coordinates } from "./coordinates.js";
export { FastMath } from "./fast_math.js";
export { HealpixTables } from "./healpix_tables.js";
export { HealpixUtils } from "./healpix_utils.js";
export { Hploc } from "./hploc.js";
export { Fxyf } from "./fxyf.js";
export {
    IThumbnail,
    IPlace,
    IUiController,
    IViewMover,
    IUIServicesCallbacks,
    ISettings,
    IUndoStep,
} from "./interfaces.js";
export { Annotation, Circle, Poly, PolyLine } from "./annotation.js";
export { SolarSystemObjects, InterpolationType, CameraParameters } from "./camera_parameters.js";
export { ConstellationFilter } from "./constellation_filter.js";
export { FitsProperties, ScaleTypes } from "./fits_properties.js";
export { Star, Galaxy } from "./star.js";
export { UiTools } from "./ui_tools.js";
export { StateType, WebFile } from "./web_file.js";

export { ColorMapContainer } from "./layers/color_map_container.js";
export { WcsImage } from "./layers/wcs_image.js";
export { FitsImage } from "./layers/fits_image.js";
export {
    DataTypes,
    ScaleMap,
    ScaleLinear,
    ScaleLog,
    ScalePow,
    ScaleSqrt,
    HistogramEqualization,
    FitsImageJs,
} from "./layers/fits_image_js.js";
export { FitsImageTile } from "./layers/fits_image_tile.js";

export { Tile } from "./tile.js";
export { RenderTriangle } from "./render_triangle.js";
export { EquirectangularTile } from "./equirectangular_tile.js";
export { HealpixTile, Xyf } from "./healpix_tile.js";
export { MercatorTile } from "./mercator_tile.js";
export { PlotTile } from "./plot_tile.js";
export { LatLngEdges, TangentTile } from "./tangent_tile.js";
export { SkyImageTile } from "./sky_image_tile.js";
export { ToastTile } from "./toast_tile.js";
export { ProjectionType, ImageSetType, BandPass, Imageset } from "./imageset.js";
export { Settings, SettingParameter, StockSkyOverlayTypes } from "./settings.js";
export { TextBorderStyle, TextObject } from "./tours/text_object.js";
export { Alignment, Text3dBatch, Text3d, GlyphItem, GlyphCache } from "./sky_text.js";
export { PointType, Lineset, Linepoint, Constellations } from "./constellations.js";
export { SpaceTimeController } from "./space_time_controller.js";
export { KeplerianElements, BodyAngles, Planets } from "./planets.js";
export { Place, Classification } from "./place.js";
export { FolderUp } from "./folder_up.js";
export { Grids } from "./grids.js";
export { KeplerVertex } from "./kepler_vertex.js";
export { Pointing } from "./pointing.js";
export { Tour } from "./tour.js";
export { VideoOutputType } from "./video_output_type.js";
export { ViewMoverKenBurnsStyle } from "./view_mover.js";
export { VizLayer } from "./viz_layer.js";
export { ColorPicker } from "./utilities/color_picker.js";
export { Dialog } from "./utilities/dialog.js";
export { Histogram } from "./utilities/histogram.js";

export { Layer, DomainValue, AltUnits, FadeType } from "./layers/layer.js";
export {
    LayerUI,
    LayerUIMenuItem,
    LayerUITreeNode,
} from "./layers/layer_ui.js";

// To keep API compatibility, we can't fix this typo.
export { GreatCirlceRouteLayer } from "./layers/great_circle_route_layer.js";

export { GridLayer } from "./layers/grid_layer.js";
export { ImageSetLayer } from "./layers/imageset_layer.js";
export {
    Group,
    Material,
    Mesh,
    Object3d,
    ObjectNode,
    Object3dLayer,
    Object3dLayerUI,
} from "./layers/object3d.js";
export { Orbit, EllipseRenderer } from "./layers/orbit.js";
export { ReferenceFrame, ReferenceFrameTypes } from "./layers/reference_frame.js";
export { OrbitLayer, OrbitLayerUI } from "./layers/orbit_layer.js";
export { Table } from "./layers/table.js";
export { Primitives, VoTable, VoRow, VoColumn } from "./layers/vo_table.js";

export { FileEntry, FileCabinet } from "./tours/file_cabinet.js";
export {
    OverlayAnchor,
    AudioType,
    ShapeType,
    LoopTypes,
    Overlay,
    AudioOverlay,
    BitmapOverlay,
    FlipbookOverlay,
    ShapeOverlay,
    TextOverlay,
} from "./tours/overlay.js";
export { Selection, SelectionAnchor } from "./tours/selection.js";
export {
    TransitionType,
    TourStop,
    LayerInfo,
    UndoTourStopChange,
} from "./tours/tour_stop.js";
export {
    Undo,
    UndoStep,
    UndoTourSlidelistChange,
    UndoTourPropertiesChange,
} from "./tours/undo.js";
export {
    TourEditor,
    OverlayList,
    TourEdit,
    SoundEditor,
    TourStopList,
    TimeLine,
} from "./tours/tour_editor.js";
export { TourPlayer, MasterTime } from "./tours/tour_player.js";

export { ISSLayer } from "./layers/iss_layer.js";
export {
    CoordinatesTypes,
    AltTypes,
    MarkerMixes,
    ColorMaps,
    PlotTypes,
    MarkerScales,
    RAUnits,
    TimeSeriesLayer,
} from "./layers/time_series_layer.js";
export {
    KmlCoordinate,
    KmlLineList,
    PushPin,
    SpreadSheetLayer,
    CatalogSpreadSheetLayer,
} from "./layers/spreadsheet_layer.js";
export { VoTableLayer } from "./layers/vo_table_layer.js";
export {
    ReferenceFrames,
    LayerManager,
    LayerMap,
    SkyOverlays,
    GroundOverlayLayer,
    FrameTarget,
} from "./layers/layer_manager.js";

// When we import this module, we install the `Layer.fromXml()` function, which
// depends on the specific layer types established above. I am probably being
// too conservative about circular module dependencies but there are worse ways
// to be.
import { layerFromXml as _ } from "./layers/from_xml.js";

// And when we import *this* module, we also attach some instances to the
// LayerManager class. I'm not sure if they're even used in the webclient, which
// would be the only place that reasonably would.
export {
    FrameWizard,
    ReferenceFrameProps,
    GreatCircleDialog,
    DataVizWizard,
} from "./layers/manager_dialogs.js";

export { UserLevel, TourDocument } from "./tours/tour_document.js";
export { TourEditTab } from "./tours/tour_edit.js";

export {
    FolderGroup,
    FolderRefreshType,
    FolderType,
    Folder,
} from "./folder.js";
export { FolderBrowser, ThumbnailSize } from "./folder_browser.js";
export { HipsProperties } from "./hips_properties.js";
export { InViewReturnMessage, RenderContext } from "./render_context.js";
export {
    SlideChangedEventArgs,
    ArrivedEventArgs,
    AnnotationClickEventArgs,
    CollectionLoadedEventArgs,
    ScriptInterface,
} from "./script_interface.js";

export {
    WWTControl,
    WWTControlBuilder,
    WWTElementEvent,
} from "./wwt_control.js";

export {
    FolderDownloadAction,
    Wtml,
} from "./wtml.js";


// GFX
//
// This was a global holder for constants used in the AstroCalc component. We've
// moved those constants into their specific modules, but still expose the name
// just in case someone actually referenced it. Since we've removed all of the
// constants that it contains, though, if someone was reckless enough to try to
// use this variable their usage would almost surely be broken by now.

import { registerType } from "./typesystem.js";

export function GFX() { }

registerType("GFX", [GFX, null, null]);


// Nontrivial initializations.

import { ss } from "./ss.js";
import { set_globalRenderContext } from "./render_globals.js";
import { set_globalWWTControl } from "./data_globals.js";
import { KeplerVertex } from "./kepler_vertex.js";
import { SpaceTimeController } from "./space_time_controller.js";
import { Folder } from "./folder.js";
import { RenderContext } from "./render_context.js";
import { WWTControl } from "./wwt_control.js";

WWTControl.exploreRoot = new Folder();
WWTControl.singleton = new WWTControl();
WWTControl.singleton.renderContext = new RenderContext();
set_globalWWTControl(WWTControl.singleton);
set_globalRenderContext(WWTControl.singleton.renderContext);

SpaceTimeController._metaNow = ss.now();
SpaceTimeController._now = ss.now();
SpaceTimeController.last = SpaceTimeController.get_metaNow();
SpaceTimeController.updateClock();

KeplerVertex.baseDate = ss.truncate(SpaceTimeController.utcToJulian(ss.now()));

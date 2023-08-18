// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling core engine settings. */

import {
  isBaseEngineSetting,
} from '@wwtelescope/engine-types';

import {
  Color,
  ConstellationFilter,
  EngineSetting,
  EngineSettingsInterface,
  EngineSettingsInterfaceRO,
} from "@wwtelescope/engine";

/** A list of the names of the core engine settings. */
export const engineSettingNames = [
  "actualPlanetScale",
  "altAzGridColor",
  "constellationArtFilter",
  "constellationBoundariesFilter",
  "constellationFigureColor",
  "constellationFiguresFilter",
  "constellationBoundryColor",
  "constellationNamesFilter",
  "constellationLabelsHeight",
  "constellations",
  "constellationSelectionColor",
  "constellationsEnabled",
  "crosshairsColor",
  "earthCutawayView",
  "eclipticColor",
  "eclipticGridColor",
  "equatorialGridColor",
  "galacticGridColor",
  "galacticMode",
  "localHorizonMode",
  "locationAltitude",
  "locationLat",
  "locationLng",
  "milkyWayModel",
  "minorPlanetsFilter",
  "planetOrbitsFilter",
  "precessionChartColor",
  "showAltAzGrid",
  "showAltAzGridText",
  "showConstellationBoundries",
  "showConstellationFigures",
  "showConstellationLabels",
  "showConstellationPictures",
  "showConstellations",
  "showConstellationSelection",
  "showCrosshairs",
  "showEarthSky",
  "showEcliptic",
  "showEclipticGrid",
  "showEclipticGridText",
  "showEclipticOverviewText",
  "showElevationModel",
  "showEquatorialGridText",
  "showGalacticGrid",
  "showGalacticGridText",
  "showGrid",
  "showHorizon",
  "showISSModel",
  "showPrecessionChart",
  "showSkyGrids",
  "showSkyOverlays",
  "showSkyOverlaysIn3d",
  "showSkyNode",
  "showSolarSystem",
  "smoothPan",
  "solarSystemCMB",
  "solarSystemCosmos",
  "solarSystemLighting",
  "solarSystemMilkyWay",
  "solarSystemMinorPlanets",
  "solarSystemMultiRes",
  "solarSystemOrbits",
  "solarSystemOverlays",
  "solarSystemPlanets",
  "solarSystemScale",
  "solarSystemStars",
  "solarSystemMinorOrbits",
];

const engineSettingTypeInfo: { [ix: string]: boolean } = {
  "altAzGridColor/Color": true,
  "constellationArtFilter/ConstellationFilter": true,
  "constellationBoundariesFilter/ConstellationFilter": true,
  "constellationBoundryColor/Color": true,
  "constellationFigureColor/Color": true,
  "constellationFiguresFilter/ConstellationFilter": true,
  "constellationNamesFilter/ConstellationFilter": true,
  "constellationSelectionColor/Color": true,
  "crosshairsColor/Color": true,
  "eclipticColor/Color": true,
  "eclipticGridColor/Color": true,
  "equatorialGridColor/Color": true,
  "galacticGridColor/Color": true,
  "precessionChartColor/Color": true,
};

/** Type guard function for `EngineSetting`. */
export function isEngineSetting(obj: [string, any]): obj is EngineSetting {
  let typekey: string = typeof obj[1];

  if (obj[1] instanceof Color) {
    typekey = "Color";
  } else if (obj[1] instanceof ConstellationFilter) {
    typekey = "ConstellationFilter";
  }

  const key = obj[0] + "/" + typekey;
  return isBaseEngineSetting(obj) || (key in engineSettingTypeInfo);
}

/** Apply a setting to the engine or an equivalent. */
export function applyEngineSetting(engine: EngineSettingsInterface, setting: EngineSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];
  (engine as any)[funcName](value);
}

/** Extract all of the current settings of the engine or an equivalent. */
export function extractEngineSettings(engine: EngineSettingsInterfaceRO): EngineSetting[] {
  const s: [string, any][] = [];

  for (const n of engineSettingNames) {
    s.push([n, (engine as any)["get_" + n]()]);
  }

  return s as EngineSetting[];
}

/** Copy settings from the engine, or an equivalent, to another. */
export function copyEngineSettings(source: EngineSettingsInterfaceRO, dest: EngineSettingsInterface): void {
  for (const n of engineSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `EngineSettingsInterface`. */
export class EngineState implements EngineSettingsInterface {
  constructor(source: EngineSettingsInterfaceRO) {
    copyEngineSettings(source, this);
  }

  actualPlanetScale!: boolean;

  get_actualPlanetScale(): boolean {
    return this.actualPlanetScale
  }

  set_actualPlanetScale(v: boolean): boolean {
    this.actualPlanetScale = v;
    return v;
  }

  constellationArtFilter!: ConstellationFilter;

  get_constellationArtFilter(): ConstellationFilter {
    return this.constellationArtFilter
  }

  set_constellationArtFilter(v: ConstellationFilter): ConstellationFilter {
    this.constellationArtFilter = v;
    return v;
  }

  constellationBoundariesFilter!: ConstellationFilter;

  get_constellationBoundariesFilter(): ConstellationFilter {
    return this.constellationBoundariesFilter
  }

  set_constellationBoundariesFilter(v: ConstellationFilter): ConstellationFilter {
    this.constellationBoundariesFilter = v;
    return v;
  }

  constellationFigureColor!: string;

  get_constellationFigureColor(): string {
    return this.constellationFigureColor
  }

  set_constellationFigureColor(v: string): string {
    this.constellationFigureColor = v;
    return v;
  }

  constellationFiguresFilter!: ConstellationFilter;

  get_constellationFiguresFilter(): ConstellationFilter {
    return this.constellationFiguresFilter
  }

  set_constellationFiguresFilter(v: ConstellationFilter): ConstellationFilter {
    this.constellationFiguresFilter = v;
    return v;
  }

  constellationBoundryColor!: string;

  get_constellationBoundryColor(): string {
    return this.constellationBoundryColor
  }

  set_constellationBoundryColor(v: string): string {
    this.constellationBoundryColor = v;
    return v;
  }

  constellationNamesFilter!: ConstellationFilter;

  get_constellationNamesFilter(): ConstellationFilter {
    return this.constellationNamesFilter
  }

  set_constellationNamesFilter(v: ConstellationFilter): ConstellationFilter {
    this.constellationNamesFilter = v;
    return v;
  }

  constellations!: boolean;

  get_constellations(): boolean {
    return this.constellations
  }

  set_constellations(v: boolean): boolean {
    this.constellations = v;
    return v;
  }

  constellationSelectionColor!: string;

  get_constellationSelectionColor(): string {
    return this.constellationSelectionColor
  }

  set_constellationSelectionColor(v: string): string {
    this.constellationSelectionColor = v;
    return v;
  }

  constellationsEnabled!: string;

  get_constellationsEnabled(): string {
    return this.constellationsEnabled
  }

  set_constellationsEnabled(v: string): string {
    this.constellationsEnabled = v;
    return v;
  }

  crosshairsColor!: string;

  get_crosshairsColor(): string {
    return this.crosshairsColor
  }

  set_crosshairsColor(v: string): string {
    this.crosshairsColor = v;
    return v;
  }

  earthCutawayView!: boolean;

  get_earthCutawayView(): boolean {
    return this.earthCutawayView
  }

  set_earthCutawayView(v: boolean): boolean {
    this.earthCutawayView = v;
    return v;
  }

  galacticMode!: boolean;

  get_galacticMode(): boolean {
    return this.galacticMode
  }

  set_galacticMode(v: boolean): boolean {
    this.galacticMode = v;
    return v;
  }

  localHorizonMode!: boolean;

  get_localHorizonMode(): boolean {
    return this.localHorizonMode
  }

  set_localHorizonMode(v: boolean): boolean {
    this.localHorizonMode = v;
    return v;
  }

  locationAltitude!: number;

  get_locationAltitude(): number {
    return this.locationAltitude
  }

  set_locationAltitude(v: number): number {
    this.locationAltitude = v;
    return v;
  }

  locationLat!: number;

  get_locationLat(): number {
    return this.locationLat
  }

  set_locationLat(v: number): number {
    this.locationLat = v;
    return v;
  }

  locationLng!: number;

  get_locationLng(): number {
    return this.locationLng
  }

  set_locationLng(v: number): number {
    this.locationLng = v;
    return v;
  }

  milkyWayModel!: boolean;

  get_milkyWayModel(): boolean {
    return this.milkyWayModel
  }

  set_milkyWayModel(v: boolean): boolean {
    this.milkyWayModel = v;
    return v;
  }

  minorPlanetsFilter!: number;

  get_minorPlanetsFilter(): number {
    return this.minorPlanetsFilter
  }

  set_minorPlanetsFilter(v: number): number {
    this.minorPlanetsFilter = v;
    return v;
  }

  planetOrbitsFilter!: number;

  get_planetOrbitsFilter(): number {
    return this.planetOrbitsFilter
  }

  set_planetOrbitsFilter(v: number): number {
    this.planetOrbitsFilter = v;
    return v;
  }

  showAltAzGrid!: boolean;

  get_showAltAzGrid(): boolean {
    return this.showAltAzGrid
  }

  set_showAltAzGrid(v: boolean): boolean {
    this.showAltAzGrid = v;
    return v;
  }

  showAltAzGridText!: boolean;

  get_showAltAzGridText(): boolean {
    return this.showAltAzGridText
  }

  set_showAltAzGridText(v: boolean): boolean {
    this.showAltAzGridText = v;
    return v;
  }

  showConstellationBoundries!: boolean;

  get_showConstellationBoundries(): boolean {
    return this.showConstellationBoundries
  }

  set_showConstellationBoundries(v: boolean): boolean {
    this.showConstellationBoundries = v;
    return v;
  }

  showConstellationFigures!: boolean;

  get_showConstellationFigures(): boolean {
    return this.showConstellationFigures
  }

  set_showConstellationFigures(v: boolean): boolean {
    this.showConstellationFigures = v;
    return v;
  }

  showConstellationLabels!: boolean;

  get_showConstellationLabels(): boolean {
    return this.showConstellationLabels
  }

  set_showConstellationLabels(v: boolean): boolean {
    this.showConstellationLabels = v;
    return v;
  }

  showConstellationPictures!: boolean;

  get_showConstellationPictures(): boolean {
    return this.showConstellationPictures
  }

  set_showConstellationPictures(v: boolean): boolean {
    this.showConstellationPictures = v;
    return v;
  }

  showConstellations!: boolean;

  get_showConstellations(): boolean {
    return this.showConstellations
  }

  set_showConstellations(v: boolean): boolean {
    this.showConstellations = v;
    return v;
  }

  showConstellationSelection!: boolean;

  get_showConstellationSelection(): boolean {
    return this.showConstellationSelection
  }

  set_showConstellationSelection(v: boolean): boolean {
    this.showConstellationSelection = v;
    return v;
  }

  showCrosshairs!: boolean;

  get_showCrosshairs(): boolean {
    return this.showCrosshairs
  }

  set_showCrosshairs(v: boolean): boolean {
    this.showCrosshairs = v;
    return v;
  }

  showEarthSky!: boolean;

  get_showEarthSky(): boolean {
    return this.showEarthSky
  }

  set_showEarthSky(v: boolean): boolean {
    this.showEarthSky = v;
    return v;
  }

  showEcliptic!: boolean;

  get_showEcliptic(): boolean {
    return this.showEcliptic
  }

  set_showEcliptic(v: boolean): boolean {
    this.showEcliptic = v;
    return v;
  }

  showEclipticGrid!: boolean;

  get_showEclipticGrid(): boolean {
    return this.showEclipticGrid
  }

  set_showEclipticGrid(v: boolean): boolean {
    this.showEclipticGrid = v;
    return v;
  }

  showEclipticGridText!: boolean;

  get_showEclipticGridText(): boolean {
    return this.showEclipticGridText
  }

  set_showEclipticGridText(v: boolean): boolean {
    this.showEclipticGridText = v;
    return v;
  }

  showEclipticOverviewText!: boolean;

  get_showEclipticOverviewText(): boolean {
    return this.showEclipticOverviewText
  }

  set_showEclipticOverviewText(v: boolean): boolean {
    this.showEclipticOverviewText = v;
    return v;
  }

  showElevationModel!: boolean;

  get_showElevationModel(): boolean {
    return this.showElevationModel
  }

  set_showElevationModel(v: boolean): boolean {
    this.showElevationModel = v;
    return v;
  }

  showEquatorialGridText!: boolean;

  get_showEquatorialGridText(): boolean {
    return this.showEquatorialGridText
  }

  set_showEquatorialGridText(v: boolean): boolean {
    this.showEquatorialGridText = v;
    return v;
  }

  showGalacticGrid!: boolean;

  get_showGalacticGrid(): boolean {
    return this.showGalacticGrid
  }

  set_showGalacticGrid(v: boolean): boolean {
    this.showGalacticGrid = v;
    return v;
  }

  showGalacticGridText!: boolean;

  get_showGalacticGridText(): boolean {
    return this.showGalacticGridText
  }

  set_showGalacticGridText(v: boolean): boolean {
    this.showGalacticGridText = v;
    return v;
  }

  showGrid!: boolean;

  get_showGrid(): boolean {
    return this.showGrid
  }

  set_showGrid(v: boolean): boolean {
    this.showGrid = v;
    return v;
  }

  showHorizon!: boolean;

  get_showHorizon(): boolean {
    return this.showHorizon
  }

  set_showHorizon(v: boolean): boolean {
    this.showHorizon = v;
    return v;
  }

  showISSModel!: boolean;

  get_showISSModel(): boolean {
    return this.showISSModel
  }

  set_showISSModel(v: boolean): boolean {
    this.showISSModel = v;
    return v;
  }

  showPrecessionChart!: boolean;

  get_showPrecessionChart(): boolean {
    return this.showPrecessionChart
  }

  set_showPrecessionChart(v: boolean): boolean {
    this.showPrecessionChart = v;
    return v;
  }

  showSkyGrids!: boolean;

  get_showSkyGrids(): boolean {
    return this.showSkyGrids
  }

  set_showSkyGrids(v: boolean): boolean {
    this.showSkyGrids = v;
    return v;
  }

  showSkyOverlays!: boolean;

  get_showSkyOverlays(): boolean {
    return this.showSkyOverlays
  }

  set_showSkyOverlays(v: boolean): boolean {
    this.showSkyOverlays = v;
    return v;
  }

  showSkyOverlaysIn3d!: boolean;

  get_showSkyOverlaysIn3d(): boolean {
    return this.showSkyOverlaysIn3d
  }

  set_showSkyOverlaysIn3d(v: boolean): boolean {
    this.showSkyOverlaysIn3d = v;
    return v;
  }

  showSkyNode!: boolean;

  get_showSkyNode(): boolean {
    return this.showSkyNode
  }

  set_showSkyNode(v: boolean): boolean {
    this.showSkyNode = v;
    return v;
  }

  showSolarSystem!: boolean;

  get_showSolarSystem(): boolean {
    return this.showSolarSystem
  }

  set_showSolarSystem(v: boolean): boolean {
    this.showSolarSystem = v;
    return v;
  }

  smoothPan!: boolean;

  get_smoothPan(): boolean {
    return this.smoothPan
  }

  set_smoothPan(v: boolean): boolean {
    this.smoothPan = v;
    return v;
  }

  solarSystemCMB!: boolean;

  get_solarSystemCMB(): boolean {
    return this.solarSystemCMB
  }

  set_solarSystemCMB(v: boolean): boolean {
    this.solarSystemCMB = v;
    return v;
  }

  solarSystemCosmos!: boolean;

  get_solarSystemCosmos(): boolean {
    return this.solarSystemCosmos
  }

  set_solarSystemCosmos(v: boolean): boolean {
    this.solarSystemCosmos = v;
    return v;
  }

  solarSystemLighting!: boolean;

  get_solarSystemLighting(): boolean {
    return this.solarSystemLighting
  }

  set_solarSystemLighting(v: boolean): boolean {
    this.solarSystemLighting = v;
    return v;
  }

  solarSystemMilkyWay!: boolean;

  get_solarSystemMilkyWay(): boolean {
    return this.solarSystemMilkyWay
  }

  set_solarSystemMilkyWay(v: boolean): boolean {
    this.solarSystemMilkyWay = v;
    return v;
  }

  solarSystemMinorPlanets!: boolean;

  get_solarSystemMinorPlanets(): boolean {
    return this.solarSystemMinorPlanets
  }

  set_solarSystemMinorPlanets(v: boolean): boolean {
    this.solarSystemMinorPlanets = v;
    return v;
  }

  solarSystemMultiRes!: boolean;

  get_solarSystemMultiRes(): boolean {
    return this.solarSystemMultiRes
  }

  set_solarSystemMultiRes(v: boolean): boolean {
    this.solarSystemMultiRes = v;
    return v;
  }

  solarSystemOrbits!: boolean;

  get_solarSystemOrbits(): boolean {
    return this.solarSystemOrbits
  }

  set_solarSystemOrbits(v: boolean): boolean {
    this.solarSystemOrbits = v;
    return v;
  }

  solarSystemOverlays!: boolean;

  get_solarSystemOverlays(): boolean {
    return this.solarSystemOverlays
  }

  set_solarSystemOverlays(v: boolean): boolean {
    this.solarSystemOverlays = v;
    return v;
  }

  solarSystemPlanets!: boolean;

  get_solarSystemPlanets(): boolean {
    return this.solarSystemPlanets
  }

  set_solarSystemPlanets(v: boolean): boolean {
    this.solarSystemPlanets = v;
    return v;
  }

  solarSystemScale!: number;

  get_solarSystemScale(): number {
    return this.solarSystemScale
  }

  set_solarSystemScale(v: number): number {
    this.solarSystemScale = v;
    return v;
  }

  solarSystemStars!: boolean;

  get_solarSystemStars(): boolean {
    return this.solarSystemStars
  }

  set_solarSystemStars(v: boolean): boolean {
    this.solarSystemStars = v;
    return v;
  }

  solarSystemMinorOrbits!: boolean;

  get_solarSystemMinorOrbits(): boolean {
    return this.solarSystemMinorOrbits
  }

  set_solarSystemMinorOrbits(v: boolean): boolean {
    this.solarSystemMinorOrbits = v;
    return v;
  }
}
